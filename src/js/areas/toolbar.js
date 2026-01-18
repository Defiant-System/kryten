
// kryten.toolbar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};
	},
	dispatch(event) {
		let APP = kryten,
			Self = APP.toolbar,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "goto-start":
			case "goto-prev-step":
			case "goto-next-step":
			case "goto-step":
				return Timeline.dispatch(event);
			case "toggle-play":
				Timeline.paused = !Timeline.paused;
				break;
		}
	}
}
