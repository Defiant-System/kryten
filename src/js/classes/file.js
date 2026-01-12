
class File {

	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "xml" });
		this._APP = kryten;

		switch (this._file.kind) {
			case "ikea": break;
			case "xml":
				// console.log(fsFile.data.xml);getA
				break;
		}

		// reset viewport
		Viewport.fpsControl.stop();
		Viewport.dispatch({ type: "reset-geometry-groups" });

		// fill in UI model texts
		["name", "assembly", "steps", "parts", "description"].map(key => {
			let el = this._APP.els.content.find(`[data-id="${key}"]`),
				suffix = el.data("suffix") || "",
				// xMeta = this._file.data.selectSingleNode(`./Meta/*[@id="${key}"]`),
				// value = xMeta.getAttribute("value") || xMeta.textContent;
				value = this.getMeta(key);
			el.html(value +" "+ suffix);
		});

		// auto insert basic geometries
		this._file.data.selectNodes(`./Pieces/*`).map(xPiece => {
			let type = xPiece.getAttribute("type"),
				geo = {};
			switch (type) {
				case "basic":
					// basic THREE build-in geometries
					geo.id = xPiece.getAttribute("id");
					geo.name = xPiece.getAttribute("name");
					geo.args = JSON.parse(xPiece.getAttribute("args"));
					geo.position = JSON.parse(xPiece.getAttribute("position")) || [0, 0, 0];
					geo.rotation = JSON.parse(xPiece.getAttribute("rotation")) || [0, 0, 0];
					break;
				case "compound":
				default:
					if (!type) type = "OBJ";
					geo.str = xPiece.textContent;
			}
			Viewport.dispatch({ type: `insert-${type}-geometry`, geo });
		});

		// update viewport & start player
		Viewport.dispatch({ type: "update-models", file: this });

		// prepare steps
		// this._file.data.selectNodes(`./Timeline/Step`).map((xStep, i) => {
		// 	let num = xStep.getAttribute("num"),
		// 		{ state, duration } = this.getState(num);
		// 	xStep.selectNodes(`./Item`).map((xTrack, j) => {
		// 		let track = {};
		// 		track.times = JSON.parse(xTrack.getAttribute("times"));
		// 		track.values = JSON.parse(xTrack.getAttribute("values"));
		// 		track.attr = xTrack.getAttribute("attr");
		// 		track.name = xTrack.getAttribute("name");
		// 		track.object = xTrack.getAttribute("object");
		// 		if (xTrack.getAttribute("repeat")) track.repeat = +xTrack.getAttribute("repeat");
		// 		if (xTrack.getAttribute("loop")) track.loop = xTrack.getAttribute("loop") === "true";
		// 		Timeline.dispatch({ type: "add-step", step: i, track });
		// 	});
		// });

		let xShadowCam = this._file.data.selectSingleNode(`./Meta/*[@id="shadowCam"]`),
			values = { top: 2, left: -2, bottom: -2, right: 2 };
		if (xShadowCam) Object.keys(values).map(k => values[k] = +xShadowCam.getAttribute(k));
		Viewport.dispatch({ type: "reset-shadow-cam", values });

		// update camera
		let xCamera = this._file.data.selectSingleNode(`./Meta/*[@id="camera"]`),
			position = JSON.parse(xCamera.getAttribute("position")),
			lookAt = JSON.parse(xCamera.getAttribute("lookAt"));
		Viewport.dispatch({ type: "reset-camera", position, lookAt});

		Viewport.dispatch({ type: "refresh-theme-values" });
		Viewport.fpsControl.start();
	}

	get base() {
		return this._file.base;
	}

	getMeta(id) {
		let xMeta = this._file.data.selectSingleNode(`//Meta/*[@id="${id}"]`),
			val;
		switch (id) {
			case "steps":
				val = 0;
				this._file.data.selectNodes(`//Timeline/*[@num]`).map(x => {
					val = Math.max(val, +x.getAttribute("num"));
				});
				return val;
		}
		if (!xMeta) return;
		val = xMeta.getAttribute("value") || xMeta.textContent;
		if (val == +val) val = +val;
		return val;
	}

	getState(num) {
		let state = [],
			xStep = this._file.data.selectSingleNode(`//Timeline/*[@num="${num}"]`),
			duration = +xStep.getAttribute("duration") || 1,
			autoNext = +xStep.getAttribute("autoNext"),
			startItems = xStep.selectNodes(`./Item`);
		startItems.map(xItem => {
			let values = {};
			[...xItem.attributes].map(k => {
				let v = k.nodeValue;
				if (v.startsWith("[") && v.endsWith("]")) v = JSON.parse(v);
				if (["true", "false"].includes(v)) v = v === "true";
				values[k.nodeName] = v;
			});
			state.push(values);
		});
		return { state, duration, autoNext };
	}

	stateToTracks(step) {
		let { state, duration, autoNext } = this.getState(step);
		// transition duration
		let times = [0, duration];
		// iterate step states
		state.map(entry => {
			let item = Viewport.objects[entry.object],
				values,
				track,
				repeat,
				attr,
				name;
			if (entry.state === "save") {
				let position = item.position.clone(),
					rotation = item.rotation.clone(),
					state = { object: item.name, position, rotation };
				Viewport.dispatch({ type: "save-item-state", state });
			} else if (entry.state === "restore") {
				// restore state from state stack
				let { position, rotation } = Viewport.dispatch({ type: "get-item-state" }),
					x = THREE.MathUtils.radToDeg(rotation.x - item.rotation.x),
					y = THREE.MathUtils.radToDeg(rotation.y - item.rotation.y),
					z = THREE.MathUtils.radToDeg(rotation.z - item.rotation.z);
				entry.position = position.sub(item.position).toArray();
				entry.rotation = [x, y, z];
			}
			// special handlers
			switch (true) {
				case entry.object === "camera":
					// anim track for position
					values = item.position.toArray().concat(...entry.position);
					track = { attr: ".position", name: "camera-move", object: "camera", times, values };
					Timeline.dispatch({ type: "add-step", step, track });
					// anim track for target
					item = Viewport.objects.lookTarget;
					values = item.position.toArray().concat(...entry.lookAt);
					track = { attr: ".position", name: "camera-target", object: "lookTarget", times, values };
					Timeline.dispatch({ type: "add-step", step, track });
					break;
				// "normal" meshes
				default:
					if (entry.hidden !== undefined) {
						item.visible = entry.hidden !== true;
					}
					if (entry.position) {
						entry.position.map((aV, i) => {
							let axis = AXIS[i],
								object = entry.object,
								oPos = Viewport.pivots[object],
								dPos = item.position.clone().toArray()[i];
							values = [dPos, dPos+aV];
							if (values[0] === values[1]) return;
							if (entry.times) times = entry.times;
							attr = `.position[${axis}]`;
							name = `${entry.object}-position-${axis}`;
							track = { attr, name, object, times, values };
							// add individual axis animation
							Timeline.dispatch({ type: "add-step", step, track });
						});
					}
					if (entry.rotation) {
						entry.rotation.map((aV, i) => {
							let axis = AXIS[i],
								object = entry.object,
								dRot = item.rotation.toArray()[i];
							// translate from degress to radians
							aV = THREE.MathUtils.degToRad(aV);
							values = [dRot, dRot+aV];
							if (values[0] === values[1]) return;
							if (entry.times) times = entry.times;
							attr = `.rotation[${axis}]`;
							name = `${entry.object}-rotation-${axis}`;
							track = { attr, name, object, times, values };
							if (entry.repeat) track.repeat = +entry.repeat;
							// add individual axis animation
							if (values[0] !== values[1]) Timeline.dispatch({ type: "add-step", step, track });
						});
					}
			}
		});
		// if step should go to next automatically
		if (autoNext) {
			Timeline.dispatch({ type: "auto-go-next-step", step, autoNext });
		}
	}

}
