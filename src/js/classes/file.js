
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
		this._file.data.selectNodes(`./Pieces/*[@type="geometry"]`).map(xGeo => {
			let geo = {
				name: xGeo.getAttribute("name"),
				args: JSON.parse(xGeo.getAttribute("args")),
				rotation: JSON.parse(xGeo.getAttribute("rotation")),
			};
			Viewport.dispatch({ type: "insert-basic-geometry", geo });
		});

		// update viewport & start player
		Viewport.dispatch({ type: "update-models" });
		Viewport.fpsControl.start();
	}

	dispatch(event) {
		let APP = kryten,
			spawn = event.spawn,
			str;
		switch (event.type) {
			case "reset-sheet-names":
				break;
		}
	}

	get base() {
		return this._file.base;
	}

	toBlob(kind) {
		
	}

	get isDirty() {
		
	}

}
