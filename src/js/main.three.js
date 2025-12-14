
// import libs
let {
	THREE,
	OrbitControls,

	BufferGeometryUtils,
	LineSegmentsGeometry,
	LineSegments2,
	LineMaterial,

	ConditionalEdgesGeometry,
	OutsideEdgesGeometry,
	ConditionalEdgesShader,
	ConditionalLineSegmentsGeometry,
	ConditionalLineMaterial,

	EffectComposer,
	RenderPass,
	ShaderPass,
	OutlinePass,
	FXAAShader,

	OBJLoader,
} = await window.fetch("~/js/bundle.js");


let renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
		// preserveDrawingBuffer: true,
	});
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.outputEncoding = THREE.sRGBEncoding;


let scene = new THREE.Scene();
let width = window.innerWidth;
let height = window.innerHeight;
let ratio = width / height;
let camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000);

// scene.background = new THREE.Color(0xeeeeee);

camera.position.set(1, 2, 6);
renderer.setSize(width, height);


	var parameters = { 
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			type: THREE.HalfFloatType,
			stencilBuffer: false,
			samples: 4,
		};
	// postprocessing
	var renderTarget = new THREE.WebGLRenderTarget(width , height, parameters);
	let composer = new EffectComposer(renderer, renderTarget);
	let renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	let outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
	composer.addPass(outlinePass);

	outlinePass.edgeStrength = 2;
	outlinePass.edgeThickness = .5;
	outlinePass.edgeGlow = .5,
	outlinePass.visibleEdgeColor.set("#666");
	outlinePass.hiddenEdgeColor.set("#025");

	let effectFXAA = new ShaderPass(FXAAShader);
	composer.addPass(effectFXAA);


let orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;
// orbit.target = new THREE.Vector3(0, 0, 0);



// Lights
let dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.bias = -1e-10;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;

let shadowCam = dirLight.shadow.camera;
shadowCam.left = shadowCam.bottom = -1;
shadowCam.right = shadowCam.top = 1;
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

// let ambientLight = new THREE.AmbientLight(0xffffff, .75);
// scene.add(ambientLight);

// let pointLight = new THREE.DirectionalLight(0xffffff, 2);
// pointLight.position.set(15, 15, 15);
// scene.add(pointLight);


let loader = new OBJLoader();
let object = new THREE.Group()

// let p001 = await loader.loadAsync("~/models/pyramid/piece.001.obj");
// object.add(p001);
// let p002 = await loader.loadAsync("~/models/pyramid/piece.002.obj");
// object.add(p002);


let cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 9));
cylinder.geometry.computeBoundingBox();
cylinder.castShadow = true;
object.add(cylinder);


// let geometry = new THREE.CylinderGeometry(1, 1, 3, 12);
// let material = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
// let cube = new THREE.Mesh(geometry, material);
// cube.position.set(1, 1, 0);
// object.add(cube);


// Add the ball.
// let ballRadius = 1.5;
// let geometry = new THREE.SphereGeometry(ballRadius, 32, 16);
// let material = new THREE.MeshBasicMaterial({ color: 0xaa0000 });
// let sphere = new THREE.Mesh(geometry, material);
// sphere.position.set(1, 1, ballRadius);
// object.add(sphere);

// outlinePass.selectedObjects = [object];
// scene.add(object);


let originalModel,
	shadowModel,
	depthModel,
	backgroundModel,
	edgesModel,
	conditionalModel;

updateModel();


function updateModel() {
	outlinePass.selectedObjects = [];
	originalModel = object;
	initEdgesModel();
	initBackgroundModel();
	initConditionalModel();

	// scene.remove(object);
}

function initBackgroundModel() {
	if (backgroundModel) {
		backgroundModel.parent.remove(backgroundModel);
		shadowModel.parent.remove(shadowModel);
		depthModel.parent.remove(depthModel);
		backgroundModel.traverse(c => c.isMesh ? c.material.dispose() : void(0));
		shadowModel.traverse(c => c.isMesh ? c.material.dispose() : void(0));
		depthModel.traverse(c => c.isMesh ? c.material.dispose() : void(0));
	}
	if (!originalModel) return;
	
	backgroundModel = originalModel.clone();
	backgroundModel.visible = true;
	backgroundModel.traverse(c => {
		if (c.isMesh) {
			c.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			c.material.polygonOffset = true;
			c.material.polygonOffsetFactor = 1;
			c.material.polygonOffsetUnits = 1;
			c.material.transparent = true;
			c.material.opacity = .25;
			c.renderOrder = 2;
		}
	});
	scene.add(backgroundModel);

	shadowModel = originalModel.clone();
	shadowModel.visible = false;
	shadowModel.traverse(c => {
		if (c.isMesh) {
			c.material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });
			c.material.polygonOffset = true;
			c.material.polygonOffsetFactor = 1;
			c.material.polygonOffsetUnits = 1;
			c.receiveShadow = true;
			c.material.transparent = true;
			c.material.opacity = .25;
			c.renderOrder = 2;
		}
	} );
	scene.add(shadowModel);

	depthModel = originalModel.clone();
	depthModel.traverse(c => {
		if (c.isMesh) {
			c.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			c.material.polygonOffset = true;
			c.material.polygonOffsetFactor = 1;
			c.material.polygonOffsetUnits = 1;
			c.material.colorWrite = false;
			c.renderOrder = 1;
		}
	} );
	scene.add(depthModel);
}

function initEdgesModel() {
	// remove any previous model
	if (edgesModel) {
		edgesModel.parent.remove(edgesModel);
		edgesModel.traverse(c => {
			if (c.isMesh) {
				if (Array.isArray(c.material)) {
					c.material.forEach(m => m.dispose());
				} else {
					c.material.dispose();
				}
			}
		});
	}

	// early out if there's no model loaded
	if (!originalModel) return;

	// store the model and add it to the scene to display
	// behind the lines
	edgesModel = originalModel.clone();
	scene.add(edgesModel);

	let meshes = [];
	edgesModel.traverse(c => c.isMesh ? meshes.push(c) : void(0));

	let threshold = 40;

	for (let key in meshes) {
		let mesh = meshes[key];
		let parent = mesh.parent;
		let lineGeom = new THREE.EdgesGeometry(mesh.geometry, threshold);

		// let mergeGeom = mesh.geometry.clone();
		// mergeGeom.deleteAttribute("uv");
		// mergeGeom.deleteAttribute("uv2");
		// let lineGeom = new OutsideEdgesGeometry(BufferGeometryUtils.mergeVertices(mergeGeom, 1e-3));
		
		let lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
		let line = new THREE.LineSegments(lineGeom, lineMat);
		line.position.copy(mesh.position);
		line.scale.copy(mesh.scale);
		line.rotation.copy(mesh.rotation);
		let thickLineGeom = new LineSegmentsGeometry().fromEdgesGeometry(lineGeom);
		let thickLineMat = new LineMaterial({ color: 0xffffff, linewidth: 1 });
		let thickLines = new LineSegments2(thickLineGeom, thickLineMat);
		thickLines.position.copy(mesh.position);
		thickLines.scale.copy(mesh.scale);
		thickLines.rotation.copy(mesh.rotation);
		parent.remove(mesh);
		parent.add(line);
		parent.add(thickLines);
	}
}

function initConditionalModel() {
	// remove the original model
	if (conditionalModel) {
		conditionalModel.parent.remove(conditionalModel);
		conditionalModel.traverse(c => c.isMesh ? c.material.dispose() : void(0));
	}

	conditionalModel = originalModel.clone();
	scene.add(conditionalModel);
	conditionalModel.visible = false;
	// get all meshes
	let meshes = [];
	conditionalModel.traverse(c => c.isMesh ? meshes.push(c) : void(0));

	for (let key in meshes) {
		let mesh = meshes[key];
		let parent = mesh.parent;
		// Remove everything but the position attribute
		let mergedGeom = mesh.geometry.clone();
		for (let key in mergedGeom.attributes) {
			if (key !== "position") {
				mergedGeom.deleteAttribute(key);
			}
		}
		// Create the conditional edges geometry and associated material
		let lineGeom = new ConditionalEdgesGeometry(BufferGeometryUtils.mergeVertices(mergedGeom));
		let material = new THREE.ShaderMaterial(ConditionalEdgesShader);
		material.uniforms.diffuse.value.set(0xffffff);
		// Create the line segments objects and replace the mesh
		let line = new THREE.LineSegments(lineGeom, material);
		line.position.copy(mesh.position);
		line.scale.copy(mesh.scale);
		line.rotation.copy(mesh.rotation);
		let thickLineGeom = new ConditionalLineSegmentsGeometry().fromConditionalEdgesGeometry(lineGeom);
		let thickLines = new LineSegments2(thickLineGeom, new ConditionalLineMaterial({ color: 0xffffff, linewidth: 2 }));
		thickLines.position.copy(mesh.position);
		thickLines.scale.copy(mesh.scale);
		thickLines.rotation.copy(mesh.rotation);
		parent.remove(mesh);
		parent.add(line);
		parent.add(thickLines);
	}
}


/*
let text = `# Blender 4.1.1
# www.blender.org
mtllib piece.001.mtl
o Cube.001
v 0.000000 1.474377 0.679538
v 1.000000 -0.025623 -0.320461
v 1.000000 -0.025623 1.679539
v -1.000000 -0.025623 -0.320461
v -1.000000 -0.025623 1.679539
v 1.000000 -0.024019 -0.324692
v -1.000000 -0.024019 -0.324692
v 0.000000 1.428664 -1.392265
v 0.000000 -1.380216 0.679539
v 0.000000 -1.320774 -1.395887
v -1.000000 -0.025761 -0.319847
v 1.000000 -0.025761 -0.319847
vn -0.0000 0.5547 0.8320
vn -0.8321 0.5547 -0.0000
vn -0.0000 -0.5939 0.8045
vn 0.8321 0.5547 -0.0000
vn -0.8280 0.5606 -0.0119
vn -0.0000 -0.5922 -0.8058
vn 0.8280 0.5606 -0.0119
vn -0.0000 -0.9351 -0.3545
vn -0.7983 -0.6021 -0.0172
vn 0.7983 -0.6021 -0.0172
vn 0.8045 -0.5939 -0.0000
vn -0.8045 -0.5939 -0.0000
vn -0.0000 0.6391 -0.7691
vn -0.0000 -0.9755 -0.2198
vt 0.375000 0.750000
vt 0.625000 1.000000
vt 0.375000 1.000000
vt 0.375000 0.000000
vt 0.625000 0.250000
vt 0.375000 0.250000
vt 0.375000 0.500000
vt 0.625000 0.750000
vt 0.625000 0.500000
vt 0.125000 0.500000
s 0
usemtl Material.001
f 3/1/1 1/2/1 5/3/1
f 5/4/2 1/5/2 4/6/2
f 3/1/3 5/3/3 9/1/3
f 2/7/4 1/8/4 3/1/4
f 4/6/5 1/5/5 8/5/5 7/6/5
f 7/6/6 8/9/6 6/7/6
f 1/8/7 2/7/7 6/7/7 8/8/7
f 2/7/8 4/10/8 7/10/8 6/7/8
f 9/4/9 4/6/9 11/6/9 10/4/9
f 2/7/10 9/7/10 10/7/10 12/7/10
f 2/7/11 3/1/11 9/7/11
f 5/4/12 4/6/12 9/4/12
f 11/10/13 12/7/13 10/10/13
f 4/10/14 2/7/14 12/7/14 11/10/14
`;
let p001 = loader.parse(text);
object.add(p001);
*/
