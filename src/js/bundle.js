
import * as THREE from "./modules/threejs/build/three.module.js";



// custom THREE.js "dispose"
THREE_dispose = () => {
	delete window.__THREE__;
};


module.exports = {
	THREE,
	THREE_dispose,
};
