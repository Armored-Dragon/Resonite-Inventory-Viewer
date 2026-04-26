class Resonite {
	constructor() {
		this.itemList = [];
		this.assetList = [];
		this.assetData = {};
		this.dontRequest = false
	}

	loadInventoryFromJSON(inventoryJSON) {
		let itemList = [];

		inventoryJSON.forEach((item) => {
			let formattedItem = this.#formatItem(item);
			itemList.push(formattedItem);
		});

		this.itemList = itemList;
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
			totalBytesString: this.bytesToMB(obj.bytes),
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

	bytesToMB(bytes) {
		return `${(bytes / 1000000).toFixed(2)} MB`;
	}

	async getAssetIsFree(hash) {
		// TODO: Error checking
		const requestUrl = `https://api.resonite.com/assets/${hash}`;

		const storageValue = localStorage.getItem(hash)

		// We have this cached ourselves.
		if (storageValue !== null) {
			console.log("Was cached.")
			const assetIsFree = storageValue === "1";
			return { value: assetIsFree, skip: true }
		}

		// Third party free asset list.
		if (freeAssetsEarthmark.includes(hash)) {
			console.log("From Earthmark asset list.")
			return { value: true, skip: true };
		}

		// Debug so we don't make a ton of requests we can not use.
		if (this.dontRequest) {
			return { value: false, skip: true };
		}

		// We do not have this cached.
		const req = await fetch(requestUrl)
			.catch(() => {
				return { value: false, skip: false };
			});

		if (!req.ok) {
			return { value: false, skip: false };
		}

		const result = await req.json();
		const assetIsFree = result.free;
		localStorage.setItem(hash, assetIsFree ? "1" : "0")

		return { value: assetIsFree, skip: false };
	}

	getItemThumbnail(uri) {
		return `https://assets.resonite.com/${uri.replace("resdb:///", "").replace(".webp", "")}`;
	}

}
