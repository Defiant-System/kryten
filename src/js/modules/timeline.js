
let Timeline = (() => {

	let clock = new THREE.Clock();
	let tape = {};
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

					values = [];
					values.push({ object: "" });
					Viewport.dispatch({ type: "reset-view", values });
					break;
				case "add-step":
					// reserv step on tape
					if (!tape[event.step]) tape[event.step] = [];
					let trackType = ["camera", "lookTarget"].includes(event.track.object) ? "VectorKeyframeTrack" : "NumberKeyframeTrack";
					track = new THREE[trackType](event.track.attr, event.track.times, event.track.values);
					item = Viewport.objects[event.track.object];

					mixer = new THREE.AnimationMixer(item);
					clip = new THREE.AnimationClip(event.track.name, Math.max(...event.track.times), [track]);
					// set loop value
					switch (true) {
						case event.track.repeat > 0: loop = [THREE.LoopRepeat, event.track.repeat]; break;
						case event.track.loop: loop = [THREE.LoopRepeat]; break;
						default: loop = [THREE.LoopOnce];
					}
					// action + mixer
					action = mixer.clipAction(clip);
					action.setLoop(...loop);
					action.clampWhenFinished = true;

					mixer.addEventListener("finished", e => Self.dispatch({ type: "anim-finished", originalEvent: e }));
					// add track to "tape"
					tape[event.step].push({ item, track, mixer, action });
					break;
				case "anim-finished":
					if (Self.activestep === Object.keys(tape).length) {
						APP.timeline.dispatch({ type: "build-completed" });
					}
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
					step = Self.activestep - 1;
					Self.dispatch({ type: "goto-step", step });
					break;
				case "goto-next-step":
					step = Self.activestep + 1;
					Self.dispatch({ type: "goto-step", step });
					break;
				case "goto-step":
					// hide meshes after "event step"
					objects = [];
					Object.keys(tape).filter(i => i < event.step).map(i => {
						tape[i].map(step => {
							objects.push(step.item.name);
						});
					});
					Viewport.dispatch({ type: "show-only-models", objects });

					// start playing step
					step = +event.step - 1;
					if (tape[step]) {
						tape[step].map(track => track.action.play());
						// save reference
						Self.activestep = +event.step;
					}
					break;
			}
		}
	};

	return tl;

})();
