
let Test = {
	init(APP) {
		
		// setTimeout(() => APP.dispatch({ type: "set-ui-theme", arg: "blueprint" }), 1500);

		// setTimeout(() => APP.dispatch({ type: "load-sample", arg: "torus.xml" }), 1000);

		// setTimeout(() => Viewport.fpsControl.start(), 500);
		setTimeout(() => Viewport.fpsControl.stop(), 5000);
		setTimeout(() => Timeline.dispatch({ type: "test-piece", arg: "001" }), 1000);
		// setTimeout(() => Viewport.dispatch({ type: "test-piece", arg: "Cube.025" }), 1000);
	}
};
