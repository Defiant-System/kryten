
let Timeline = (() => {

	let AXIS = ["x", "y", "z"];
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
					// accumulate scene / objects state
					let { state, duration } = APP.file.getState("start");
					Self.dispatch({ type: "transition-to-start", state, duration });
					break;
				case "transition-to-start":
					// add tracks before steps to "tape" - from current to start state
					tape.unshift(null);
					// transition duration
					times = [0, event.duration];
					
					event.state.map(entry => {
						let item = Viewport.objects[entry.object];
						switch (true) {
							case entry.object === "camera":
								// anim track for position
								values = item.position.toArray().concat(...entry.position);
								track = { attr: ".position", name: "camera-move", object: "camera", times, values };
								Self.dispatch({ type: "add-step", step: 0, track });
								// anim track for target
								item = Viewport.objects.lookTarget;
								values = item.position.toArray().concat(...entry.lookAt);
								track = { attr: ".position", name: "camera-target", object: "lookTarget", times, values };
								Self.dispatch({ type: "add-step", step: 0, track });
								break;
							default:
								if (entry.hidden !== undefined) {
									item.visible = entry.hidden !== true;
								}
								if (entry.position) {
									entry.position.map((aV, i) => {
										let axis = AXIS[i],
											object = entry.object;
										values = [item.position.toArray()[i], aV];
										attr = `.position[${axis}]`;
										name = `${entry.object}-position-${axis}`;
										track = { attr, name, object, times, values };
										// add individual axis animation
										if (values[0] !== values[1]) Self.dispatch({ type: "add-step", step: 0, track });
									});
								}
								if (entry.rotation) {
									entry.rotation.map((aV, i) => {
										let axis = AXIS[i],
											object = entry.object;
										// translate from degress to radians
										aV = (Math.PI/180) * aV;
										values = [item.rotation.toArray()[i], aV];
										attr = `.rotation[${axis}]`;
										name = `${entry.object}-rotation-${axis}`;
										track = { attr, name, object, times, values };
										// add individual axis animation
										if (values[0] !== values[1]) Self.dispatch({ type: "add-step", step: 0, track });
									});
								}
						}
					});

					Self.dispatch({ type: "goto-step", step: 1 });
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
					// start playing step
					step = +event.step - 1;
					if (tape[step]) {
						tape[step].map(track => {
							if (step > 0) track.item.visible = true;
							track.action.play();
						});
						// save reference
						Self.activestep = +event.step;
					}
					break;
			}
		}
	};

	return tl;

})();
