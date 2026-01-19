
// kryten.showcase

{
	init() {
		// fast references
		this.els = {
			el: window.find(".showcase"),
			content: window.find("content"),
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
				APP.blankView.dispatch({ type: "show-blank-view" });
				Viewport.dispatch({ type: "reset-scene" });
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
			case "close-congratulations":
				Self.els.content.removeClass("build-finished");
				Self.dispatch({ type: "close-file" });
				break;
		}
	}
}
