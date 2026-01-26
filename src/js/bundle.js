
import * as THREE from "./modules/threejs/build/three.module.js";

import FindSurfaces from "./modules/opp/FindSurfaces.js";
import { CustomOutlinePass } from "./modules/opp/CustomOutlinePass.js";
import { ColoredShadowMaterial } from './modules/outlines/ColoredShadowMaterial.js';

import { CSG } from './modules/csg/CSG.js';

import { EffectComposer } from './modules/threejs/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './modules/threejs/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './modules/threejs/examples/jsm/postprocessing/ShaderPass.js';
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

	FindSurfaces,
	CustomOutlinePass,
	ColoredShadowMaterial,

	CSG,

	EffectComposer,
	RenderPass,
	ShaderPass,
	FXAAShader,

	OBJLoader,
	OrbitControls,
};
