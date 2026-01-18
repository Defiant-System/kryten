
// kryten.showcase

{
	init() {
		// fast references
		this.els = {
			el: window.find(".showcase"),
			content: window.find(".blank-view"),
		};
	},
	dispatch(event) {
		let APP = kryten,
			Self = APP.showcase,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "close-file":
				APP.startView.dispatch({ type: "show-blank-view" });
				break;
			case "toggle-speech":
				value = event.el.data("speech") === "on";
				event.el.data("speech", value ? "off" : "on");
				karaqu.shell(`sys -f ${!value}`);
				break;
			case "goto-start":
			case "goto-prev-step":
			case "goto-next-step":
				Timeline.dispatch(event);
				break;
			case "goto-step":
				Timeline.dispatch({ type: "goto-step", step: +event.arg });
				break;
			case "toggle-play":
				Timeline.paused = !Timeline.paused;
				break;
			case "build-completed":
				Self.els.content.find(`.congratulations h2 span`).html(APP.file.getMeta("name"));
				Self.els.content.addClass("build-finished");
				break;
		}
	}
}
