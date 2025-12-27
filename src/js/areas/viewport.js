
// import libs
let {
	THREE,
	OrbitControls, //
	BufferGeometryUtils,
	LineSegmentsGeometry,
	LineSegments2,
	LineMaterial, //
	ColoredShadowMaterial,
	ConditionalEdgesGeometry,
	OutsideEdgesGeometry,
	ConditionalEdgesShader,
	ConditionalLineSegmentsGeometry,
	ConditionalLineMaterial, //
	OBJLoader,
} = await window.fetch("~/js/bundle.js");


let Viewport = (() => {

	let edgesThreshold = 40,
		width = window.innerWidth,
		height = window.innerHeight,
		ratio = width / height,
		loader = new OBJLoader(),
		originalModel = new THREE.Group(),
		objectGroup = new THREE.Group(),
		shadowModel,
		edgesModel,
		conditionalModel,
		theme,
		renderer,
		scene,
		camera,
		dirLight,
		shadowCam,
		floor,
		orbit;

	let vp = {
		init(APP) {
			// save reference to app
			this.APP = APP;

			this.dispatch({ type: "refresh-theme-values" });
			this.dispatch({ type: "init-viewport" });
			// this.dispatch({ type: "load-object-model" });

			// this.dispatch({ type: "update-models" });
			this.dispatch({ type: "init-player" });
		},
		dispatch(event) {
			let Self = vp,
				APP = Self.APP,
				x, y, z,
				meshes,
				item;
			switch (event.type) {
				case "init-viewport":
					// renderer setup
					renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
					renderer.setPixelRatio(window.devicePixelRatio);
					renderer.shadowMap.enabled = true;
					renderer.shadowMap.type = THREE.PCFSoftShadowMap;
					renderer.setSize(width, height);
					// scene setup
					scene = new THREE.Scene();
					// camera
					camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000);
					camera.position.set(.65, .75, 1.5);
					// orbit controls
					orbit = new OrbitControls(camera, renderer.domElement);
					orbit.enableZoom = false;
					// lights setup
					dirLight = new THREE.DirectionalLight(theme.lightColor, 1.0);
					dirLight.position.set(7, 6, -1);
					dirLight.castShadow = true;
					dirLight.shadow.bias = -1e-10;
					dirLight.shadow.mapSize.width = 1024;
					dirLight.shadow.mapSize.height = 1024;
					// shadows setup
					shadowCam = dirLight.shadow.camera;
					shadowCam.left = shadowCam.bottom = -1;
					shadowCam.right = shadowCam.top = 1;
					scene.add(dirLight);
					// floor setup
					floor = new THREE.Mesh(
						new THREE.PlaneGeometry(),
						new THREE.ShadowMaterial({ color: 0xffffff, opacity: 0, transparent: true })
					);
					floor.rotation.x = - Math.PI / 2;
					floor.scale.setScalar(20);
					floor.receiveShadow = true;
					scene.add(floor);
					// view object setup
					objectGroup.castShadow = true;
					scene.add(objectGroup);
					// add renderer canvas to window body
					APP.els.showcase.append(renderer.domElement);
					break;
				case "init-player":
					// create FPS controller
					Self.fpsControl = karaqu.FpsControl({
						fps: 50,
						// autoplay: true,
						callback(time, delta) {
							objectGroup.rotation.y -= 0.005;
							// objectGroup.rotation.x += 0.02;
							// objectGroup.rotation.z += 0.015;

							renderer.render(scene, camera);
						}
					});
					break;
				case "reset-camera":
					camera.position.set(...event.position);
					camera.lookAt(...event.lookAt);
					camera.updateProjectionMatrix();
					shadowCam.updateProjectionMatrix();
					break;
				case "reset-geometry-groups":
					objectGroup.children.map(c => c.parent.remove(c));
					objectGroup.traverse(c => c.isMesh ? c.material.dispose() : void(0));
					originalModel.children.map(c => c.parent.remove(c));
					originalModel.traverse(c => c.isMesh ? c.material.dispose() : void(0));
					break;
				case "insert-basic-geometry":
					// loop values
					item = new THREE.Mesh(new THREE[event.geo.name](...event.geo.args));
					item.geometry.computeBoundingBox();
					item.castShadow = true;
					// rotation in relation to the camera
					[x, y, z] = event.geo.rotation;
					item.rotation.x += Math.PI * x;
					item.rotation.y += Math.PI * y;
					item.rotation.z += Math.PI * z;
					// add item to original model
					originalModel.add(item);
					break;
				case "insert-OBJ-geometry":
					item = loader.parse(event.geo.str);
					originalModel.add(item);
					break;
				case "update-color-theme":
					// dirLight.color.set(0xff0000); // event.data.lightColor
					floor.material.color.set(theme.floorColor);
					break;
				case "refresh-theme-values":
					// prepare to update three.js
					theme = {
						lightColor: null,
						floorColor: null,
						materialShadowHigh: null,
						materialShadowLow: null,
						edgesColor: null,
						edgesLine: null,
						conditionalEdgesColor: null,
						conditionalEdgesLine: null,
					};
					// get theme values
					Object.keys(theme).map(key => {
						let value = APP.els.content.cssProp(`--${key}`);
						if (value == +value) value = +value;
						theme[key] = value;
					});
					// update models if requeired
					if (event.update) Self.dispatch({ type: "update-models" });
					break;
				case "update-models":
					if (!originalModel.children.length) return;
					// init models
					Self.dispatch({ type: "init-edges-model" });
					Self.dispatch({ type: "init-background-model" });
					Self.dispatch({ type: "init-conditional-model" });
					if (originalModel.children[0].geometry) {
						// update floor
						floor.material.color.set(theme.floorColor);
						floor.material.opacity = .2;
						floor.position.y = originalModel.children[0].geometry.boundingBox.min.y - .025;
					}
					break;
				case "init-edges-model":
					if (shadowModel) {
						shadowModel.parent.remove(shadowModel);
						shadowModel.traverse(c => {
							if (!c.isMesh) return;
							if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
							else c.material.dispose();
						});
					}
					shadowModel = originalModel.clone();
					shadowModel.visible = true;
					shadowModel.traverse(c => {
						if (!c.isMesh) return;
						c.material = new ColoredShadowMaterial({ color: theme.materialShadowHigh, shininess: 1.0 });
						c.material.polygonOffset = true;
						c.material.polygonOffsetFactor = 1;
						c.material.polygonOffsetUnits = 1;
						c.receiveShadow = true;
						c.material.transparent = false;
						c.material.shadowColor.set(theme.materialShadowLow);
						c.renderOrder = 2;
					});
					objectGroup.add(shadowModel);
					break;
				case "init-background-model":
					if (edgesModel) {
						edgesModel.parent.remove(edgesModel);
						edgesModel.traverse(c => {
							if (!c.isMesh) return;
							if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
							else c.material.dispose();
						});
					}
					// store the model and add it to the scene to display behind the lines
					edgesModel = originalModel.clone();
					objectGroup.add(edgesModel);

					meshes = [];
					edgesModel.traverse(c => c.isMesh ? meshes.push(c) : void(0));
					for (let key in meshes) {
						let mesh = meshes[key];
						let parent = mesh.parent;
						let lineGeom = new THREE.EdgesGeometry(mesh.geometry, edgesThreshold);
						let lineMat = new THREE.LineBasicMaterial({ color: theme.edgesColor });
						let line = new THREE.LineSegments(lineGeom, lineMat);
						line.position.copy(mesh.position);
						line.scale.copy(mesh.scale);
						line.rotation.copy(mesh.rotation);
						let thickLineGeom = new LineSegmentsGeometry().fromEdgesGeometry(lineGeom);
						let thickLineMat = new LineMaterial({ color: theme.edgesColor, linewidth: theme.edgesLine });
						let thickLines = new LineSegments2(thickLineGeom, thickLineMat);
						thickLines.position.copy(mesh.position);
						thickLines.scale.copy(mesh.scale);
						thickLines.rotation.copy(mesh.rotation);
						parent.remove(mesh);
						parent.add(line);
						parent.add(thickLines);
					}
					break;
				case "init-conditional-model":
					if (conditionalModel) {
						conditionalModel.parent.remove(conditionalModel);
						conditionalModel.traverse(c => {
							if (!c.isMesh) return;
							if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
							else c.material.dispose();
						});
					}
					conditionalModel = originalModel.clone();
					objectGroup.add(conditionalModel);
					conditionalModel.visible = true;
					// get all meshes
					meshes = [];
					conditionalModel.traverse(c => c.isMesh ? meshes.push(c) : void(0));

					for (let key in meshes) {
						let mesh = meshes[key];
						let parent = mesh.parent;
						// Remove everything but the position attribute
						let mergedGeom = mesh.geometry.clone();
						for (let key in mergedGeom.attributes) {
							if (key !== "position") mergedGeom.deleteAttribute(key);
						}
						// Create the conditional edges geometry and associated material
						let lineGeom = new ConditionalEdgesGeometry(BufferGeometryUtils.mergeVertices(mergedGeom));
						let material = new THREE.ShaderMaterial(ConditionalEdgesShader);
						material.uniforms.diffuse.value.set(theme.conditionalEdgesColor);
						// Create the line segments objects and replace the mesh
						let line = new THREE.LineSegments(lineGeom, material);
						line.position.copy(mesh.position);
						line.scale.copy(mesh.scale);
						line.rotation.copy(mesh.rotation);
						let thickLineGeom = new ConditionalLineSegmentsGeometry().fromConditionalEdgesGeometry(lineGeom);
						let thickLines = new LineSegments2(thickLineGeom, new ConditionalLineMaterial({ color: theme.conditionalEdgesColor, linewidth: theme.conditionalEdgesLine }));
						thickLines.position.copy(mesh.position);
						thickLines.scale.copy(mesh.scale);
						thickLines.rotation.copy(mesh.rotation);
						parent.remove(mesh);
						parent.add(line);
						parent.add(thickLines);
					}
					break;
			}
		}
	};

	return vp;

})();
