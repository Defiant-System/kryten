
// kryten.toolbar

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="toolbar"]`),
			content: window.find("content"),
		};
	},
	dispatch(event) {
		let APP = kryten,
			Self = APP.toolbar,
			list,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "enable-tools":
				list = event.list || [];
				list.map(type => {
					Self.els.el.find(`.toolbar-tool_[data-click="${type}"]`).removeClass("tool-disabled_");
				});
				break;
			case "disable-tools":
				list = event.list || ["toggle-fps", "goto-start", "goto-prev-step", "goto-next-step"];
				list.map(type => {
					Self.els.el.find(`.toolbar-tool_[data-click="${type}"]`).addClass("tool-disabled_");
				});
				break;
			case "toggle-fps":
				el = Self.els.el.find(`.toolbar-tool_[data-click="toggle-fps"]`);
				value = el.hasClass("tool-active_");

				if (value) Viewport.fpsControl.start();
				else Viewport.fpsControl.stop();
				// toolbar button state
				return !value;
			case "toggle-microphone":
				el = Self.els.el.find(`.toolbar-tool_[data-click="toggle-microphone"]`);
				value = el.hasClass("tool-active_");
				el.find("span")
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
