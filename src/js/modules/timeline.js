
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
			if (step !== undefined && tape[step] !== undefined) {
				let clockDelta = clock.getDelta();
				tape[step].map(track => {
					track.mixer.update(clockDelta);
					if (track.item.name === "lookTarget") {
						console.log(111);
						Viewport.items.camera.lookAt(track.item.position);
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
				clip,
				track,
				action,
				mixer;
			// console.log(event);
			switch (event.type) {
				case "add-step":
					// reserv step on tape
					if (!tape[event.step]) tape[event.step] = [];
					let trackType = ["camera", "lookTarget"].includes(event.track.item) ? "VectorKeyframeTrack" : "NumberKeyframeTrack";
					track = new THREE[trackType](event.track.attr, event.track.times, event.track.values);
					item = Viewport.items[event.track.item];

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
					// add track to "tape"
					tape[event.step].push({ item, track, mixer, action });
					break;
				case "play-step":
					step = +event.step - 1;
					if (tape[step]) tape[step].map(track => track.action.play());
					break;
			}
		}
	};

	return tl;

})();
