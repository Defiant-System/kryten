
let Timeline = (() => {

	let clock = new THREE.Clock();
	let tape = [];
	let step;


	let tl = {
		init(APP) {
			// save reference to app
			this.APP = APP;

			this.paused = true;

			// setTimeout(() => this.dispatch({ type: "play-next" }), 500);
		},
		tick(time, delta) {
			if (step !== undefined && tape[step] !== undefined) {
				let clockDelta = clock.getDelta();
				tape[step].map(track => {
					track.mixer.update(clockDelta);
					if (track.item.name === "lookTarget") {
						Viewport.objects.camera.lookAt(track.item.position);
					}
				});
			}
		},
		dispatch(event) {
			let Self = tl,
				APP = Self.APP,
				loop,
				attr,
				times,
				values,
				item,
				objects,
				clip,
				track,
				action,
				mixer;
			// console.log(event);
			switch (event.type) {
				case "goto-start":
					// pause "auto-rotation"
					Self.paused = false;
					Self.activestep = 0;
					Self.dispatch({ type: "goto-step", step: 0 });
					// update toolbar
					APP.toolbar.dispatch({ type: "disable-tools", list: ["goto-start"] });
					APP.toolbar.dispatch({ type: "enable-tools", list: ["goto-next-step"] });
					break;
				case "add-step":
					// reserv step on tape
					if (!tape[event.step]) tape[event.step] = [];
					let trackType = ["camera", "lookTarget"].includes() ? "VectorKeyframeTrack" : "NumberKeyframeTrack";
					track = new THREE[trackType](event.track.attr, event.track.times, event.track.values);
					item = event.track.mesh || Viewport.objects[event.track.object];

					mixer = new THREE.AnimationMixer(item);
					clip = new THREE.AnimationClip(event.track.name, Math.max(...event.track.times), [track]);
					// set loop value
					switch (true) {
						case event.track.repeat > 8: loop = [THREE.LoopRepeat]; break;
						case event.track.repeat > 0: loop = [THREE.LoopRepeat, event.track.repeat]; break;
						default: loop = [THREE.LoopOnce];
					}
					// action + mixer
					action = mixer.clipAction(clip);
					action.setLoop(...loop);
					action.clampWhenFinished = true;

					mixer.addEventListener("finished", e => Self.dispatch({ type: "anim-finished", originalEvent: e }));
					// add track to "tape"
					tape[event.step].push({ item, track, mixer, action, repeat: event.track.repeat });
					break;
				case "anim-finished":
					// reset flag
					delete Self.isAnimating;

					if (Self.activestep === APP.file.getMeta("steps")) {
						APP.showcase.dispatch({ type: "build-completed" });
					}
					break;
				case "auto-go-next-step":
					action = { play() { setTimeout(() => {
						delete Self.isAnimating;
						Self.dispatch({ type: "goto-next-step" });
					}, event.autoNext * 1000); } };
					mixer = { update() {} };
					item = {};

					step = +event.step;
					tape[step].push({ item, item, action, mixer });
					break;
				case "play-step":
					step = +event.step - 1;
					if (tape[step]) {
						tape[step].map(track => track.action.play());
						// save reference
						Self.activestep = step;
					}
					break;
				case "goto-prev-step":
					if (Self.isAnimating) return;
					step = Self.activestep - 1;
					Self.dispatch({ type: "goto-step", step });
					break;
				case "goto-next-step":
					if (Self.isAnimating) return;
					step = Self.activestep + 1;
					Self.dispatch({ type: "goto-step", step });
					break;
				case "goto-step":
					if (Self.isAnimating) return;
					// start playing step
					step = +event.step;
					// accumulate scene / objects state
					APP.file.stateToTracks(step);
					// if step is on tape
					if (!tape[step]) return;
					// prevents animation interuptions
					Self.isAnimating = true;
					// step number
					APP.els.stepNum.html(step);
					// play it white boy
					tape[step].map(track => {
						if (track.repeat) delete Self.isAnimating;
						track.action.play();
					});
					// save reference
					Self.activestep = +event.step;
					break;
			}
		}
	};

	return tl;

})();
