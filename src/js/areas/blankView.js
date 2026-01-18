
// kryten.blankView

{
	init() {
		// fast references
		this.els = {
			el: window.find(".blank-view"),
			content: window.find(".blank-view"),
		};

		// get settings, if any
		let xList = $.xmlFromString(`<Recents/>`);
		let xSamples = window.bluePrint.selectSingleNode(`//Samples`);
		this.xRecent = window.settings.getItem("recents") || xList.documentElement;

		Promise.all(this.xRecent.selectNodes("./*").map(async xItem => {
				let filepath = xItem.getAttribute("filepath"),
					check = await karaqu.shell(`fs -f '${filepath}'`);
				if (!check.result) {
					xItem.parentNode.removeChild(xItem)
				}
			}))
			.then(() => {
				let target = this.els.content;

				// add recent files in to data-section
				xSamples.parentNode.append(this.xRecent);
				// render blank view
				window.render({
					template: "blank-view",
					match: `//Data`,
					target,
				});
				// more fast references
				this.els.btnOpen = target.find(`.btn[data-click="open-filesystem"]`);
				this.els.btnClipboard = target.find(`.btn[data-click="new-from-clipboard"]`);
				this.els.btnClose = target.find(`.btn[data-click="close-view"]`);

				this.dispatch({ type: "show-blank-view" });
			});
	},
	dispatch(event) {
		let APP = kryten,
			Self = APP.blankView,
			file,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "show-blank-view":
				APP.els.content.data({ show: "blank-view" });
				break;
			case "load-sample":
				// open application local sample file
				Self.openLocal(`~/samples/${event.name || event.arg}`)
					.then(fsFile => {
						Self.file = new File(fsFile);
					});
				break;
		}
	},
	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					let reader = new FileReader();
					reader.addEventListener("load", () => {
						// file info blob
						file.blob = blob;
						file.size = blob.size;
						// this will then display a text file
						file.data = $.xmlFromString(reader.result).documentElement;
						resolve(file);
					}, false);
					// get file contents
					reader.readAsText(blob);
				})
				.catch(err => reject(err));
		});
	}
}
