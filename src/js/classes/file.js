
class File {

	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "xml" });
		this._APP = kryten;

		// reset viewport
		Viewport.fpsControl.stop();
		Viewport.dispatch({ type: "reset-geometry-groups" });

		// fill in UI model texts
		["name", "assembly", "steps", "parts", "description"].map(key => {
			let el = this._APP.els.content.find(`[data-id="${key}"]`),
				suffix = el.data("suffix") || "",
				value = this.getMeta(key);
			el.html(value +" "+ suffix);
		});

		switch (this.getMeta("kind")) {
			case "glb":
				Viewport.loader.load("~/samples/lack/lack.glb", file => {
					console.log(file);
				});
				break;
			case "xml":
				this._file.data.selectNodes(`./Pieces/*`).map(xPiece => {
					// basic THREE build-in geometries
					let geo = {
						id: xPiece.getAttribute("id"),
						name: xPiece.getAttribute("name"),
						args: JSON.parse(xPiece.getAttribute("args")),
						position: JSON.parse(xPiece.getAttribute("position")) || [0, 0, 0],
						rotation: JSON.parse(xPiece.getAttribute("rotation")) || [0, 0, 0],
					};
					Viewport.dispatch({ type: `insert-basic-geometry`, geo });
				});
				this.initScene();
				break;
		}
	}

	get base() {
		return this._file.base;
	}

	initScene() {
		// update viewport & start player
		Viewport.dispatch({ type: "update-models", file: this });

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

}
