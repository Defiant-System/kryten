
import * as THREE from "./modules/threejs/build/three.module.js";

import { ToIndexed } from './modules/outlines/BufferGeometryToIndexed.js';
import { OutlineMaterial } from './modules/outlines/OutlineMaterial.js';
import { OutlineMesh } from './modules/outlines/OutlineMesh.js';
import { ColoredShadowMaterial } from './modules/outlines/ColoredShadowMaterial.js';

import { EffectComposer } from './modules/threejs/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './modules/threejs/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './modules/threejs/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from './modules/threejs/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from './modules/threejs/examples/jsm/shaders/FXAAShader.js';

import { OBJLoader } from "./modules/threejs/examples/jsm/loaders/OBJLoader.js";
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

	EffectComposer,
	RenderPass,
	ShaderPass,
	OutlinePass,
	FXAAShader,

	OBJLoader,
	OrbitControls,
};
