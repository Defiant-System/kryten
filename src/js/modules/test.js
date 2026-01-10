
let Test = {
	init(APP) {
		
		// setTimeout(() => APP.dispatch({ type: "set-ui-theme", arg: "blueprint" }), 500);

		// setTimeout(() => APP.dispatch({ type: "load-sample", arg: "torus.xml" }), 1000);

		// setTimeout(() => Viewport.fpsControl.start(), 500);
		// setTimeout(() => Viewport.fpsControl.stop(), 3000);

		// setTimeout(() => Viewport.dispatch({ type: "test-piece", arg: "Cube.025" }), 1000);
		setTimeout(() => APP.timeline.dispatch({ type: "goto-start" }), 1000);
		setTimeout(() => Timeline.dispatch({ type: "goto-next-step" }), 2500);
	}
};
