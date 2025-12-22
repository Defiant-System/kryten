
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
			fps: 50,
			autoplay: true,
			callback(time, delta) {
				OG.rotation.y += 0.005;
				// OG.rotation.x += 0.02;
				// OG.rotation.z += 0.015;

				renderer.render(scene, camera);
				// composer.render();
			}
		});

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = kryten,
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
				if (Self.fpsControl._stopped) Self.fpsControl.start();
				else Self.fpsControl.stop();
				break;
			case "set-ui-theme":
				Self.els.content.data({ theme: event.arg });
				break;
		}
	}
};

window.exports = kryten;
