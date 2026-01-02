
let Test = {
	init(APP) {
		
		// setTimeout(() => APP.dispatch({ type: "set-ui-theme", arg: "blueprint" }), 500);

		// setTimeout(() => APP.dispatch({ type: "load-sample", arg: "torus.xml" }), 1000);

		// setTimeout(() => Viewport.fpsControl.start(), 500);
		setTimeout(() => Viewport.fpsControl.stop(), 5000);

		// setTimeout(() => Viewport.dispatch({ type: "test-piece", arg: "Cube.025" }), 1000);
		setTimeout(() => Timeline.dispatch({ type: "play-step", step: 1, track: 1 }), 1000);
	}
};
