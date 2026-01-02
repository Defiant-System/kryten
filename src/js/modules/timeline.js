
let Timeline = (() => {

	let clock = new THREE.Clock();
	let tape = {};
	let step;


	let tl = {
		init(APP) {
			// save reference to app
			this.APP = APP;

			// setTimeout(() => this.dispatch({ type: "play-next" }), 500);
		},
		tick(time, delta) {
			if (step !== undefined) {
				// testPiece.rotation.y += 0.01;

				let clockDelta = clock.getDelta();
				tape[step].map(track => track.mixer.update(clockDelta));
			}
		},
		dispatch(event) {
			let Self = tl,
				APP = Self.APP,
				loop,
				attr,
				times,
				values,
				piece,
				clip,
				track,
				action,
				mixer;
			// console.log(event);
			switch (event.type) {
				case "add-step":
					// reserv step on tape
					if (!tape[event.step]) tape[event.step] = [];
					track = new THREE.NumberKeyframeTrack(event.track.attr, event.track.times, event.track.values);
					piece = Viewport.pieces[event.track.piece];
					mixer = new THREE.AnimationMixer(piece);
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
					// add track to "tape"
					tape[event.step].push({ piece, track, mixer, action });
					break;
				case "play-step":
					step = +event.step - 1;
					tape[step].map(track => track.action.play());
					break;
				case "play-next":
					testPiece = Viewport.pieces[event.arg];
					// if (!testPiece) return;
					// testPiece.visible = true;

					mixer = new THREE.AnimationMixer(testPiece);
					mixer.addEventListener("finished", (event) => {
						if (event.action === action) {
							console.log("Action finished!");
						}
					});
					action = mixer.clipAction(clip);
					
					// action.setLoop(THREE.LoopRepeat);
					// action.setLoop(THREE.LoopOnce, 1);
					action.setLoop(THREE.LoopRepeat, 1);
					// action.clampWhenFinished = true;
					action.play();

					// setTimeout(() => action.stop(), 500);
					break;
			}
		}
	};

	return tl;

})();
