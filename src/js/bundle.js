
import * as THREE from "./modules/threejs/build/three.module.js";

import { ToIndexed } from './modules/outlines/BufferGeometryToIndexed.js';
import { OutlineMaterial } from './modules/outlines/OutlineMaterial.js';
import { OutlineMesh } from './modules/outlines/OutlineMesh.js';
import { ColoredShadowMaterial } from './modules/outlines/ColoredShadowMaterial.js';

import { GLTFLoader } from "./modules/threejs/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "./modules/threejs/examples/jsm/controls/OrbitControls.js";



// custom THREE.js "dispose"
THREE_dispose = () => {
	delete window.__THREE__;
};


module.exports = {
	THREE,
	THREE_dispose,

	ToIndexed,
	OutlineMaterial,
	OutlineMesh,
	ColoredShadowMaterial,

	GLTFLoader,
	OrbitControls,
};
