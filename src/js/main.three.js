
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
renderer.outputEncoding = THREE.sRGBEncoding;


let scene = new THREE.Scene();
let ratio = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000);

camera.position.set(1, 5, 5);
renderer.setSize(window.innerWidth, window.innerHeight);


let orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;
// orbit.target = new THREE.Vector3(0, 0, 0);



let ambientLight = new THREE.AmbientLight(0xffffff, .35);
scene.add(ambientLight);

let pointLight = new THREE.DirectionalLight(0xffffff, 2);
pointLight.position.set(15, 15, 15);
scene.add(pointLight);


let loader = new OBJLoader();
let object = new THREE.Group()

let p001 = await loader.loadAsync("~/models/pyramid/piece.001.obj");
let p002 = await loader.loadAsync("~/models/pyramid/piece.002.obj");

object.add(p001);
object.add(p002);

// object.scale.set(.0035, .0035, .0035);
// object.rotateY(-Math.PI / 2);
// object.position.set(1, 2, 0);

// let object = await loader.loadAsync("~/models/windmill.obj");
// object.scale.set(.0035, .0035, .0035);
// object.rotateY(-Math.PI / 2);
// object.position.set(1, 2, 0);

// let object = await loader.loadAsync("~/models/C3_stool_design_bureau_ODESD2.obj");
// object.scale.set(.005, .005, .005);
// object.rotateX(-Math.PI / 2);
// object.position.set(1, 2, 0);

scene.add(object);


// let geometry = new THREE.BoxGeometry(1, 1, 1);
// let material = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
// let cube = new THREE.Mesh(geometry, material);
// cube.position.set(1, 1, 0);
// scene.add( cube );


// Add the ball.
// let ballRadius = 1.5;
// let geometry = new THREE.SphereGeometry(ballRadius, 32, 16);
// let material = new THREE.MeshBasicMaterial({ color: 0xaa0000 });
// let sphere = new THREE.Mesh(geometry, material);
// sphere.position.set(1, 1, ballRadius);
// scene.add(sphere);
