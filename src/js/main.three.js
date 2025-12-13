
// import libs
let {
	THREE,
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
let ratio = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera( 60, ratio, 0.1, 1000 );


// let orbit = new OrbitControls(camera, renderer.domElement);
// orbit.enableZoom = false;


camera.position.set(1, 1, 5);
renderer.setSize(window.innerWidth, window.innerHeight);

let pointLight = new THREE.DirectionalLight(0xffffff, 3);
pointLight.position.set(15, 15, 15);
scene.add(pointLight);


const loader = new OBJLoader();
const object = await loader.loadAsync("~/models/sedan.obj");
// const object = await loader.loadAsync("~/models/C3_stool_design_bureau_ODESD2.obj");
scene.add( object );


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
