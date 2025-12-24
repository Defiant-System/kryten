
let Test = {
	init(APP) {
		
		setTimeout(() => APP.dispatch({ type: "set-ui-theme", arg: "blueprint" }), 1500);

		// setTimeout(() => APP.fpsControl.start(), 500);
		setTimeout(() => APP.fpsControl.stop(), 6000);

	}
};
