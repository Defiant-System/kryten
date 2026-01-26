
let Viewport = (() => {

	let width = window.innerWidth,
		height = window.innerHeight,
		ratio = width / height,
		loader = new OBJLoader(),
		param = { depthTexture: new THREE.DepthTexture(), depthBuffer: true },
		renderTarget = new THREE.WebGLRenderTarget(width, height, param),
		originalModel = new THREE.Group(),
		objectGroup = new THREE.Group(),
		surfaceFinder = new FindSurfaces(),
		customOutline,
		renderer,
		scene,
		camera,
		lookTarget,
		dirLight,
		shadowCam,
		floor,
		orbit,
		composer,
		pass;


	let vp = {
		init(APP) {
			// save reference to app
			this.APP = APP;
			// memory records
			this.objects = {};
			this.pivots = {};
			this.states = {};

			this.dispatch({ type: "refresh-theme-values" });
			this.dispatch({ type: "init-viewport" });
			this.dispatch({ type: "init-player" });
		},
		dispatch(event) {
			let Self = vp,
				APP = Self.APP,
				x, y, z,
				meshes,
				object;
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
					lookTarget = new THREE.Object3D();
					lookTarget.name = "lookTarget";

					// orbit controls
					orbit = new OrbitControls(camera, renderer.domElement);
					// orbit.enableDamping = true;
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
					shadowCam.left = shadowCam.bottom = -5;
					shadowCam.right = shadowCam.top = 5;
					scene.add(dirLight);

					// post processing
					composer = new EffectComposer(renderer, renderTarget);
					pass = new RenderPass(scene, camera);
					composer.addPass(pass);

					// Outline pass.
					customOutline = new CustomOutlinePass(
						new THREE.Vector2(width, height),
						scene,
						camera
					);
					composer.addPass(customOutline);

					// Antialias pass.
					let effectFXAA = new ShaderPass(FXAAShader);
					effectFXAA.uniforms["resolution"].value.set(
						1 / width,
						1 / height
					);
					composer.addPass(effectFXAA);

					// floor setup
					floor = new THREE.Mesh(
						new THREE.PlaneGeometry(),
						new THREE.ShadowMaterial({ color: 0xffffff, opacity: 0, transparent: true })
					);
					floor.rotation.x = -Math.PI / 2;
					floor.scale.setScalar(50);
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
						fps: 5,
						// autoplay: true,
						callback(time, delta) {
							if (Timeline.paused) {
								objectGroup.rotation.y -= 0.0025;
							} else Timeline.tick(time, delta);

							composer.render();
						}
					});
					break;
				case "insert-basic-geometry":
					// loop values
					object = new THREE.Mesh(new THREE[event.geo.name](...event.geo.args));
					object.geometry.computeBoundingBox();
					object.receiveShadow = true;
					object.castShadow = true;
					object.position.set(...event.geo.position);
					// rotation in relation to the camera
					[x, y, z] = event.geo.rotation;
					object.rotation.x += THREE.MathUtils.degToRad(x);
					object.rotation.y += THREE.MathUtils.degToRad(y);
					object.rotation.z += THREE.MathUtils.degToRad(z);
					// set mesh id/name
					object.name = event.geo.id;
					// add object to original model
					originalModel.add(object);

					break;
				case "update-models":
				// case "add-surface-id-attribute-to-mesh":
					surfaceFinder.surfaceId = 0;

					scene.traverse(c => {
						if (c.type == "Mesh") {
							const colorsTypedArray = surfaceFinder.getSurfaceIdAttribute(c);
							c.geometry.setAttribute(
								"color",
								new THREE.BufferAttribute(colorsTypedArray, 4)
							);
						}
					});

					customOutline.updateMaxSurfaceId(surfaceFinder.surfaceId + 1);
					break;
			}
		}
	};

	return vp;

})();
