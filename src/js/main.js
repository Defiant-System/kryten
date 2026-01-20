
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
@import "./modules/viewport.js";
@import "./modules/timeline.js";
@import "./modules/test.js"


const AXIS = ["x", "y", "z"];


const kryten = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			stepNum: window.find("h2[data-prefix]"),
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
				Self.dispatch({ type: "show-blank-view" });
				break;
			// custom events
			case "kryten-sleep":
			case "kryten-wake":
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
				return Self.toolbar.dispatch(event);
			case "set-ui-theme":
				Self.els.content.data({ theme: event.arg });
				Viewport.dispatch({ type: "refresh-theme-values" });
				break;
			case "change-edges-threshold":
				Viewport.dispatch(event);
				break;
			case "close-congratulations":
				return Self.showcase.dispatch(event);
			case "show-blank-view":
			case "load-sample":
				return Self.blankView.dispatch(event);
			default:
				el = event.el;
				if (!el && event.origin) el = event.origin.el;
				if (!el || !el.length) el = Self.els.showcase.find(`.microphone`);
				if (el) {
					let pEl = el.parents(`?div[data-area]`);
					if (!pEl.length) pEl = Self.els.showcase;
					if (pEl.length) {
						let name = pEl.data("area");
						return Self[name].dispatch(event);
					}
				}
		}
	},
	toolbar: @import "./areas/toolbar.js",
	blankView: @import "./areas/blankView.js",
	showcase: @import "./areas/showcase.js",
};

window.exports = kryten;
