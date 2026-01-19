
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
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "toggle-microphone":
				value = event.el.hasClass("tool-active_");
				event.el.find("span")
					.removeClass("icon-mic-off icon-mic-on")
					.css({ "background-image": `url("~/icons/${value ? "icon-mic-off" : "icon-mic-on"}.png")` });
				// toggle speech support
				karaqu.shell(`sys -f ${!value}`);
				// toolbar button state
				return !value;
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
