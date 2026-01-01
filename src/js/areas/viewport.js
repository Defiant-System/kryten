
// import libs
let {
	THREE,
	THREE_dispose,

	ToIndexed,
	OutlineMaterial,
	OutlineMesh,
	ColoredShadowMaterial,

	EffectComposer,
	RenderPass,
	ShaderPass,
	OutlinePass,
	FXAAShader,

	OBJLoader,
	OrbitControls,
} = await window.fetch("~/js/bundle.js");


let Viewport = (() => {

	let width = window.innerWidth,
		height = window.innerHeight,
		ratio = width / height,
		loader = new OBJLoader(),
		mtlLine = new OutlineMaterial(70, true, "#888"),
		mtlShadow = new ColoredShadowMaterial({
			color: 0xffffff,
			shadowColor: 0xdddddd,
			// shininess: 1.0,
			// transparent: true,
			// opacity: 0.95,
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1,
		}),
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
					dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
					dirLight.position.set(5, 10, 5);
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
				case "insert-basic-geometry":
					// loop values
					item = new THREE.Mesh(new THREE[event.geo.name](...event.geo.args));
					item.geometry.computeBoundingBox();
					item.receiveShadow = true;
					item.castShadow = true;
					item.position.set(...event.geo.position);
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
					item.traverse(c => {
						if (!c.isMesh) return;
						c.geometry.computeBoundingBox();
						c.receiveShadow = true;
						c.castShadow = true;
					});
					originalModel.add(item);
					break;
				case "update-models":
					// return console.log(originalModel);
					originalModel.traverse(c => {
						if (!c.isMesh) return;
						// shadow material
						let sGeo = c.geometry.clone();
						let sMesh = new THREE.Mesh(sGeo, mtlShadow);
						objectGroup.add(sMesh);

						// outlines
						let lGeo = sGeo.clone().toIndexed(false);
						let lMesh = new THREE.Mesh(lGeo);
						let lObj = new OutlineMesh(lMesh, mtlLine);
						objectGroup.add(lObj);
					});
					// update floor
					let firstGeo = originalModel.children[0].isMesh
									? originalModel.children[0]
									: originalModel.children[0].children[0];
					if (firstGeo.geometry) {
						floor.material.color.set(theme.floorColor);
						floor.material.opacity = .2;
						floor.position.y = firstGeo.geometry.boundingBox.min.y - .025;
					}
					break;
			}
		}
	};

	return vp;

})();
