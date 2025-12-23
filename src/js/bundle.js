
import * as THREE from "./modules/threejs/build/three.module.js";
import * as BufferGeometryUtils from "./modules/threejs/examples/jsm/utils/BufferGeometryUtils.js";

import { LineSegmentsGeometry } from "./modules/threejs/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineSegments2 } from "./modules/threejs/examples/jsm/lines/LineSegments2.js";
import { LineMaterial } from "./modules/threejs/examples/jsm/lines/LineMaterial.js";

import { ColoredShadowMaterial } from "./modules/conditional-lines/ColoredShadowMaterial.js";
import { ConditionalEdgesGeometry } from "./modules/conditional-lines/ConditionalEdgesGeometry.js";
import { OutsideEdgesGeometry } from "./modules/conditional-lines/OutsideEdgesGeometry.js";
import { ConditionalEdgesShader } from "./modules/conditional-lines/ConditionalEdgesShader.js";
import { ConditionalLineSegmentsGeometry } from "./modules/conditional-lines/ConditionalLineSegmentsGeometry.js";
import { ConditionalLineMaterial } from "./modules/conditional-lines/ConditionalLineMaterial.js";

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

	ColoredShadowMaterial,
	ConditionalEdgesGeometry,
	OutsideEdgesGeometry,
	ConditionalEdgesShader,
	ConditionalLineSegmentsGeometry,
	ConditionalLineMaterial,

	OBJLoader,
	OrbitControls,
};
