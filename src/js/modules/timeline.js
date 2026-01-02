
let Timeline = (() => {

	let clock = new THREE.Clock();

	// Animate position.y
	// let track1 = new THREE.NumberKeyframeTrack(
	//   ".position[y]",
	//   [0, 0.3, 0.5, 0.7, 1.0],
	//   [0, 0.6, 0.7, 0.6, 0]
	// );

	// Animate rotation.y
	let track1 = new THREE.NumberKeyframeTrack(
	  ".position[y]",
	  [0, 4],
	  [0, .75]
	);

	// Animate rotation.y
	let track2 = new THREE.NumberKeyframeTrack(
	  ".rotation[y]",
	  [0, 4],
	  [0, Math.PI * 2]
	);

	// Create animation clip (duration = 1 second)
	let clip = new THREE.AnimationClip("bounce", Math.max(...track1.times), [track1, track2]);
	let mixer,
		action,
		testPiece;


	let tl = {
		init(APP) {
			// save reference to app
			this.APP = APP;

		},
		tick(time, delta) {
			if (testPiece) {
				// testPiece.rotation.y += 0.01;

				let clockDelta = clock.getDelta();
				mixer.update(clockDelta);
			}
		},
		dispatch(event) {
			let Self = tl,
				APP = Self.APP,
				item;
			switch (event.type) {
				case "setup-timeline":
					break;
				case "test-piece":
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
