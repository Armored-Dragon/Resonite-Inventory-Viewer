const qsa = (selector) => document.querySelectorAll(selector);
const qs = (selector) => document.querySelector(selector);

let fileList = [];
let assets = [];

const fileImportInput = qs('#json-importer');
const itemAssetList = qs('#item-asset-list');

fileImportInput.addEventListener("change", readInventoryJSON);

function openModalToAssetList(item_id) {
	const tbody = qs('#item-asset-list tbody');
	tbody.innerHTML = '';
	const fileListItem = fileList.find((listItem) => listItem.id == item_id);
	fileListItem.assetManifest = sortByByteSize(fileListItem.assetManifest);
	fileListItem.assetManifest.forEach(insertAssetElement);
	itemAssetList.showModal();
}

function findAllInstancesOfAssetId(asset_id) { }
function openModal() { }
function closeDialog() {
	itemAssetList.close();
}

function sortByByteSize(arr) {
	return arr.sort((a, b) => b.totalBytes - a.totalBytes)
}

function readInventoryJSON() {
	if (fileImportInput.files.length <= 0) return;

	let reader = new FileReader();
	reader.addEventListener("load", () => handleFileContents(JSON.parse(reader.result)));
	reader.readAsText(fileImportInput.files[0]);

	function handleFileContents(inventoryJSON) {
		let itemList = [];

		inventoryJSON.forEach((item) => {
			let itemResponse = {
				id: item.id,
				name: item.name,
				assetManifest: item.assetManifest,
				uniqueAssets: 0,
				assets: 0,
				totalBytes: 0,
				totalSize: ""
			}
			itemResponse.assetManifest = itemResponse.assetManifest.map(obj => ({ hash: obj.hash, totalBytes: obj.bytes }));

			item.assetManifest.forEach((asset) => {
				const assetIsInArray = assets.some((obj) => obj.hash === asset.hash);
				itemResponse.assets++;
				if (assetIsInArray) return;

				assets.push(asset);
				itemResponse.totalBytes += asset.bytes;
				itemResponse.uniqueAssets++;
			})
			itemList.push(itemResponse);
			itemResponse.totalSize = bytesToMB(itemResponse.totalBytes);
		})
		fileList = sortByByteSize(itemList)
		fileList.forEach(insertItemElement)
	}
}

function insertItemElement(item) {
	const template = qs("#item-listing-template");
	const clone = template.content.cloneNode(true);
	let td = clone.querySelectorAll("td");
	td[0].innerHTML = `<a onclick="openModalToAssetList('${item.id}')" href="#">${item.name}</a>`;
	td[1].textContent = item.id;
	td[2].textContent = item.assets;
	td[3].textContent = item.uniqueAssets;
	td[4].textContent = item.totalSize;
	const tbody = qs('#chart tbody');
	tbody.appendChild(clone);
}

function insertAssetElement(asset) {
	const tbody = qs('#item-asset-list tbody');
	const template = qs("#asset-listing-template");
	const clone = template.content.cloneNode(true);
	let td = clone.querySelectorAll("td");
	td[0].textContent = asset.hash;
	td[1].textContent = bytesToMB(asset.totalBytes);
	tbody.appendChild(clone);
}

function bytesToMB(bytes) {
	return `${(bytes / 1000000).toFixed(2)} MB`
}