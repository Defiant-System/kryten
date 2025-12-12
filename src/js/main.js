
@import "./main.three.js";
@import "./modules/test.js"


const kryten = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			showcase: window.find(".showcase"),
		};
		// add renderer canvas to window body
		this.els.showcase.append(renderer.domElement);


		// create FPS controller
		this.fpsControl = karaqu.FpsControl({
			fps: 2,
			autoplay: true,
			callback(time, delta) {
				renderer.render(scene, camera);
			}
		});

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = kryten;
