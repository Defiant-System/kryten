
class File {

	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "xml" });
		this._APP = kryten;

		switch (this._file.kind) {
			case "ikea": break;
			case "xml":
				// console.log(fsFile.data.xml);
				break;
		}

		// reset viewport
		Viewport.fpsControl.stop();
		Viewport.dispatch({ type: "reset-geometry-groups" });

		// fill in UI model texts
		["name", "assembly", "steps", "parts", "description"].map(key => {
			let el = this._APP.els.content.find(`[data-id="${key}"]`),
				suffix = el.data("suffix") || "",
				xMeta = this._file.data.selectSingleNode(`./Meta/*[@id="${key}"]`),
				value = xMeta.getAttribute("value") || xMeta.textContent;
			el.html(value +" "+ suffix);
		});

		// auto insert basic geometries
		this._file.data.selectNodes(`./Pieces/*`).map(xPiece => {
			let type = xPiece.getAttribute("type"),
				geo = {};
			switch (type) {
				case "basic":
					// basic THREE build-in geometries
					geo.name = xPiece.getAttribute("name");
					geo.args = JSON.parse(xPiece.getAttribute("args"));
					geo.position = JSON.parse(xPiece.getAttribute("position"));
					geo.rotation = JSON.parse(xPiece.getAttribute("rotation"));
					break;
				default:
					type = "OBJ";
					geo.str = xPiece.textContent;
			}
			Viewport.dispatch({ type: `insert-${type}-geometry`, geo });
		});

		// update viewport & start player
		Viewport.dispatch({ type: "update-models" });

		// update camera
		let xCamera = this._file.data.selectSingleNode(`./Meta/*[@id="camera"]`),
			position = JSON.parse(xCamera.getAttribute("position")),
			lookAt = JSON.parse(xCamera.getAttribute("lookAt"));
		Viewport.dispatch({ type: "reset-camera", position, lookAt});

		Viewport.fpsControl.start();
	}

	get base() {
		return this._file.base;
	}

	toBlob(kind) {
		
	}

	get isDirty() {
		
	}

}
