class Resonite {
	constructor(inventoryJson) {
		this.assetList = [];
		this.itemList = this.#formatJSON(inventoryJson);
	}

	#formatJSON(inventoryJSON) {
		let workingItemList = [];

		inventoryJSON.forEach((item) => {
			let itemResponse = {
				id: item.id,
				name: item.name,
				assetManifest: item.assetManifest,
				uniqueAssetManifest: [],
				assets: 0,
				totalBytes: 0,
				totalBytesString: "",
				uniqueBytes: 0,
				uniqueBytesString: "",
				location: item.path,
				tags: item.tags,
				isForPatrons: item.isForPatrons,
				thumbnail: item.thumbnailUri ? this.#getAssetThumbnail(item.thumbnailUri) : null,
			};
			itemResponse.assetManifest = itemResponse.assetManifest.map((obj) => ({ hash: obj.hash, totalBytes: obj.bytes, totalBytesString: this.#bytesToMB(obj.bytes) }));

			item.assetManifest.forEach((asset) => {
				const assetIsInArray = this.assetList.some((obj) => obj.hash === asset.hash);
				itemResponse.assets++;
				itemResponse.totalBytes += asset.bytes;
				if (assetIsInArray) return;

				this.assetList.push(asset);

				itemResponse.uniqueAssetManifest.push(asset);
				itemResponse.uniqueBytes += asset.bytes;
			});

			workingItemList.push(itemResponse);
			itemResponse.uniqueAssetManifest = itemResponse.uniqueAssetManifest.map((obj) => ({ hash: obj.hash, totalBytes: obj.bytes, totalBytesString: this.#bytesToMB(obj.bytes) }));

			itemResponse.totalBytesString = this.#bytesToMB(itemResponse.totalBytes);
			itemResponse.uniqueBytesString = this.#bytesToMB(itemResponse.uniqueBytes);
		});

		return workingItemList;
	}

	#bytesToMB(bytes) {
		return `${(bytes / 1000000).toFixed(2)} MB`;
	}

	#getAssetThumbnail(thumbnailUri) {
		return `https://assets.resonite.com/${thumbnailUri.replace("resdb:///", "").replace(".webp", "")}`;
	}

	getFilteredList({ name, isMessage, isPublic, isForPatrons, isListed, isReadOnly, isDeleted } = {}) {
		let filteredList = [...this.itemList];

		if (name) filteredList = filteredList.filter((item) => item.name.toLowerCase().includes(searchTerm));
		if (isMessage) filteredList = filteredList.filter((item) => item.tags.includes("message_item"));
		if (isPublic) filteredList = filteredList.filter((item) => item.isPublic);
		if (isForPatrons) filteredList = filteredList.filter((item) => item.isForPatrons);
		if (isListed) filteredList = filteredList.filter((item) => item.isListed);
		if (isReadOnly) filteredList = filteredList.filter((item) => item.isReadOnly);
		if (isDeleted) filteredList = filteredList.filter((item) => item.isDeleted);

		return filteredList;
	}

	sortBySize(arr) {
		return arr.sort((a, b) => b.totalBytes - a.totalBytes);
	}
}
