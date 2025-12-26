
class File {

	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "xml" });

		switch (this._file.kind) {
			case "ikea":
				break;
			case "xml":
				console.log(fsFile.data.xml);
				break;
		}
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
