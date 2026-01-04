
let Viewport = (() => {

	let width = window.innerWidth,
		height = window.innerHeight,
		ratio = width / height,
		loader = new OBJLoader(),
		mtlLine = new OutlineMaterial(20, true, "#888"),
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
		cameraRig = new THREE.Object3D(),
		lookTarget = new THREE.Object3D(),
		dirLight,
		shadowCam,
		floor,
		orbit,
		// postprocessing
		postprocess = 0,
		param = { 
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			type: THREE.HalfFloatType,
			stencilBuffer: false,
			samples: 4,
		},
		renderTarget = new THREE.WebGLRenderTarget(width, height, param),
		composer,
		renderPass,
		outlinePass,
		effectFXAA;


	let vp = {
		init(APP) {
			// save reference to app
			this.APP = APP;
			// memory record
			this.items = {};

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
					// mount camera on the rig
					// cameraRig.add(camera);
					// cameraRig.name = "cameraRig";
					// cameraRig.position.set(.65, .75, 1.5);

					lookTarget.name = "lookTarget";

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
					shadowCam.left = shadowCam.bottom = -20;
					shadowCam.right = shadowCam.top = 20;
					scene.add(dirLight);
					
					/* postprocessing
					composer = new EffectComposer(renderer, renderTarget);
					renderPass = new RenderPass(scene, camera);
					composer.addPass(renderPass);
					outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
					composer.addPass(outlinePass);
					outlinePass.edgeStrength = 5.0,
					outlinePass.edgeThickness = 0.5;
					// outlinePass.edgeGlow = 0.0,
					outlinePass.visibleEdgeColor.set('#ff3300');
					outlinePass.hiddenEdgeColor.set('#002255');
					// outlinePass.selectedObjects = [objectGroup];
					effectFXAA = new ShaderPass(FXAAShader);
					composer.addPass(effectFXAA);
					*/

					// floor setup
					floor = new THREE.Mesh(
						new THREE.PlaneGeometry(),
						new THREE.ShadowMaterial({ color: 0xffffff, opacity: 0, transparent: true })
					);
					floor.rotation.x = - Math.PI / 2;
					floor.scale.setScalar(50);
					floor.receiveShadow = true;
					scene.add(floor);
					// view object setup
					objectGroup.castShadow = true;
					scene.add(objectGroup);
					// add renderer canvas to window body
					APP.els.showcase.append(renderer.domElement);

					Self.items.light = dirLight;
					Self.items.camera = camera;
					Self.items.lookTarget = lookTarget;
					Self.items.cameraRig = cameraRig;
					Self.items.shadowCam = shadowCam;
					Self.items.scene = scene;
					break;
				case "init-player":
					// create FPS controller
					Self.fpsControl = karaqu.FpsControl({
						fps: 50,
						// autoplay: true,
						callback(time, delta) {
							Timeline.tick(time, delta);

							objectGroup.rotation.y -= 0.0025;

							if (postprocess) composer.render();
							else renderer.render(scene, camera);
						}
					});
					break;
				case "reset-camera":
					Self.items.lookTarget.position.set(...event.lookAt);
					Self.items.camera.position.set(...event.position);
					Self.items.camera.lookAt(Self.items.lookTarget.position);
					Self.items.camera.updateProjectionMatrix();
					Self.items.shadowCam.updateProjectionMatrix();
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
					};
					// get theme values
					Object.keys(theme).map(key => {
						let value = APP.els.content.cssProp(`--${key}`);
						if (value == +value) value = +value;
						theme[key] = value;
					});
					// update models if requeired
					objectGroup.traverse(c => {
						// if (!c.isMesh) return;
						switch (c.type) {
							case "LineSegments":
								c.material.color = new THREE.Color(theme.edgesColor);
								break;
							case "Mesh":
								c.material.color = new THREE.Color(theme.materialShadowHigh);
								c.material.shadowColor = new THREE.Color(theme.materialShadowLow);
								break;
						}
					});
					if (floor) {
						// update floor color
						floor.material.color.set(theme.floorColor);
						floor.material.opacity = .2;
					}
					break;
				case "change-edges-threshold":
					// update material angle threshold
					mtlLine.angleThreshold = +event.arg;
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
					item.rotation.x += (Math.PI/180) * x;
					item.rotation.y += (Math.PI/180) * y;
					item.rotation.z += (Math.PI/180) * z;
					// set mesh id/name
					item.name = event.geo.id;
					// add item to original model
					originalModel.add(item);
					break;
				case "insert-compound-geometry":
				case "insert-OBJ-geometry":
					item = loader.parse(event.geo.str);
					item.traverse(c => {
						if (!c.isMesh) return;
						c.geometry.computeBoundingBox();
					});
					originalModel.add(item);
					break;
				case "show-only-models":
					Object.keys(Self.items).filter(k => k.startsWith("--")).map(key => {
						Self.items[key].visible = event.items.includes(key);
					});
					break;
				case "update-models":
					// for floor
					y = Infinity;
					// prepare render objects
					originalModel.traverse(c => {
						if (!c.isMesh) return;
						let oGroup = new THREE.Group();
						oGroup.position.set(...c.position.toArray());
						oGroup.rotation.set(...c.rotation.toArray());
						// find out where floor should be
						y = Math.min(y, c.geometry.boundingBox.min.y);
						// shadow material
						let sGeo = c.geometry.clone();
						let sMesh = new THREE.Mesh(sGeo, mtlShadow);
						sMesh.receiveShadow = true;
						sMesh.castShadow = true;
						oGroup.add(sMesh);
						// outlines
						let lGeo = sGeo.clone();
						if (!lGeo.index) lGeo = lGeo.toIndexed(false);
						let lMesh = new THREE.Mesh(lGeo);
						let lObj = new OutlineMesh(lMesh, mtlLine);
						oGroup.add(lObj);
						// name of item as group name
						oGroup.name = c.name;
						// hide "helper" meshes
						if (oGroup.name.startsWith("--")) oGroup.visible = false;
						// save references to items
						Self.items[c.name] = oGroup;
						// insert in to scene
						objectGroup.add(oGroup);
					});
					// update floor
					floor.material.color.set(theme.floorColor);
					floor.material.opacity = .2;
					floor.position.y = y - .025;
					break;
			}
		}
	};

	return vp;

})();
