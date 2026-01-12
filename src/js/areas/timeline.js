
// kryten.timeline

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};
	},
	dispatch(event) {
		let APP = kryten,
			Self = APP.timeline,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
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
