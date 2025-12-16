
import * as THREE from "./modules/threejs/build/three.module.js";
import * as BufferGeometryUtils from "./modules/threejs/examples/jsm/utils/BufferGeometryUtils.js";

import { LineSegmentsGeometry } from "./modules/threejs/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineSegments2 } from "./modules/threejs/examples/jsm/lines/LineSegments2.js";
import { LineMaterial } from "./modules/threejs/examples/jsm/lines/LineMaterial.js";

import { ConditionalEdgesGeometry } from "./modules/threejs/examples/jsm/lines/conditional/ConditionalEdgesGeometry.js";
import { OutsideEdgesGeometry } from "./modules/threejs/examples/jsm/lines/conditional/OutsideEdgesGeometry.js";
import { ConditionalEdgesShader } from "./modules/threejs/examples/jsm/lines/conditional/ConditionalEdgesShader.js";
import { ConditionalLineSegmentsGeometry } from "./modules/threejs/examples/jsm/lines/conditional/ConditionalLineSegmentsGeometry.js";
import { ConditionalLineMaterial } from "./modules/threejs/examples/jsm/lines/conditional/ConditionalLineMaterial.js";

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
	OrbitControls,
};
