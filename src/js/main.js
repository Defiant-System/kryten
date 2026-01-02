
// import libs
let {
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
} = await window.fetch("~/js/bundle.js");


@import "./classes/file.js"
@import "./areas/viewport.js";
@import "./modules/timeline.js";
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

		Timeline.init(this);
		Viewport.init(this);
		
		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = kryten,
			data,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "load-sample":
				// open application local sample file
				Self.openLocal(`~/samples/${event.name || event.arg}`)
					.then(fsFile => {
						Self.File = new File(fsFile);
					});
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			// proxy events to viewport
			case "before-contextmenu:app-ui-layout":
				// reset "select theme" menu options
				window.bluePrint.selectNodes(`//Menu[@click="set-ui-theme"]`).map(xMenu => xMenu.removeAttribute("is-checked"));
				// update active "select theme" menu option
				value = Self.els.content.data("theme");
				window.bluePrint.selectSingleNode(`//Menu[@click="set-ui-theme"][@arg="${value}"]`).setAttribute("is-checked", "1");
				break;
			case "toggle-play-pause":
				if (Viewport.fpsControl._stopped) Viewport.fpsControl.start();
				else Viewport.fpsControl.stop();
				break;
			case "set-ui-theme":
				Self.els.content.data({ theme: event.arg });
				Viewport.dispatch({ type: "refresh-theme-values", update: true });
				break;
			case "change-edges-threshold":
				Viewport.dispatch(event);
				break;
		}
	},
	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					let reader = new FileReader();
					reader.addEventListener("load", () => {
						// file info blob
						file.blob = blob;
						file.size = blob.size;
						// this will then display a text file
						file.data = $.xmlFromString(reader.result).documentElement;
						resolve(file);
					}, false);
					// get file contents
					reader.readAsText(blob);
				})
				.catch(err => reject(err));
		});
	}
};

window.exports = kryten;
