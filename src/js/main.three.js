
// import libs
let {
	THREE,
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
let camera = new THREE.PerspectiveCamera( 60, ratio, 0.1, 1000 );

let ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
let pointLight = new THREE.PointLight(0xffffff, 1);

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(1, 1, 5);
pointLight.position.set(10, 15, 13);

scene.add(ambientLight);
scene.add(pointLight);


// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );


// Add the ball.
let ballRadius = 1.5;
let geometry = new THREE.SphereGeometry(ballRadius, 32, 16);
let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let sphere = new THREE.Mesh(geometry, material);
sphere.position.set(1, 1, ballRadius);
scene.add(sphere);
