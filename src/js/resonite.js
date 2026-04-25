class Resonite {
	constructor() {
		this.assetList = [];
		this.assetData = {};
	}

	loadInventoryFromJSON(inventoryJSON) {
		let itemList = [];

		inventoryJSON.forEach((item) => {
			let formattedItem = this.#formatItem(item);
			itemList.push(formattedItem);
		});

		this.assetList = itemList;
	}

	#formatItem(item) {
		let itemResponse = {
			...item,
			thumbnail: item.thumbnailUri
				? this.getItemThumbnail(item.thumbnailUri)
				: null,
			assets: 0,
			totalBytes: 0,
			totalBytesString: "",
			uniqueBytes: 0,
			uniqueBytesString: "",
			uniqueAssetManifest: [],
		};

		itemResponse.assetManifest = itemResponse.assetManifest.map((obj) => ({
			hash: obj.hash,
			totalBytes: obj.bytes,
			totalBytesString: this.#bytesToMB(obj.bytes),
		}));

		item.assetManifest.forEach((asset) => {
			const assetIsInArray = this.assetList.some(
				(obj) => obj.hash === asset.hash,
			);
			itemResponse.assets++;
			itemResponse.totalBytes += asset.bytes;
			if (assetIsInArray) return;

			this.assetList.push(asset);

			itemResponse.uniqueAssetManifest.push(asset);
			itemResponse.uniqueBytes += asset.bytes;
		});

		return itemResponse;
	}

	#bytesToMB(bytes) {
		return `${(bytes / 1000000).toFixed(2)} MB`;
	}

	async getAssetMetadata(hash) {
		// TODO: Error checking
		const requestUrl = `https://api.resonite.com/assets/${hash}`;
		const req = await fetch(requestUrl);

		if (!req.ok) {
			return {};
		}

		const result = await req.json();
		return result;
	}

	getItemThumbnail(uri) {
		return `https://assets.resonite.com/${uri.replace("resdb:///", "").replace(".webp", "")}`;
	}

	getFiltered() {}
}
