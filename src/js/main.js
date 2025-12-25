
@import "./areas/viewport.js";
@import "./modules/test.js"


const kryten = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			showcase: window.find(".showcase"),
		};

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		Viewport.init(this);
		


		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = kryten,
			data,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			case "toggle-play-pause":
				if (Viewport.fpsControl._stopped) Viewport.fpsControl.start();
				else Viewport.fpsControl.stop();
				break;
			case "set-ui-theme":
				Self.els.content.data({ theme: event.arg });
				
				Viewport.dispatch({ type: "refresh-theme-values", update: true });
				break;
		}
	}
};

window.exports = kryten;
