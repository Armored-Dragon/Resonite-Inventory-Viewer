const qsa = (selector) => document.querySelectorAll(selector);
const qs = (selector) => document.querySelector(selector);

let fileList = [];
let assets = [];

const fileImportInput = qs('#json-importer');
const itemAssetList = qs('#item-asset-list');

fileImportInput.addEventListener("change", readInventoryJSON);

function openModalToAssetList(item_id) {
	const tbodyAll = qs('#inspect-all-assets tbody');
	const tbodyUnique = qs('#inspect-unique-assets tbody');
	tbodyAll.innerHTML = '';
	tbodyUnique.innerHTML = '';
	const fileListItem = fileList.find((listItem) => listItem.id == item_id);
	fileListItem.assetManifest = sortByByteSize(fileListItem.assetManifest);
	fileListItem.uniqueAssetManifest = sortByByteSize(fileListItem.uniqueAssetManifest);

	fileListItem.assetManifest.forEach((elem) => insertAssetElement(elem, false));
	fileListItem.uniqueAssetManifest.forEach((elem) => insertAssetElement(elem, true));

	qs(`#inspect-name`).innerText = fileListItem.name;
	qs(`#inspect-location`).innerText = fileListItem.location;
	qs(`#inspect-total-assets`).innerText = fileListItem.assets;
	qs(`#inspect-unique-assets`).innerText = fileListItem.uniqueAssetManifest.length;
	qs(`#inspect-total-size`).innerText = fileListItem.totalSize;
	qs(`#inspect-real-size`).innerText = bytesToMB(fileListItem.uniqueBytes);
	qs(`#item-inspection .thumbnail img`).src = fileListItem.thumbnail;
	showInspectionPage();
}

function sortByByteSize(arr) {
	return arr.sort((a, b) => b.totalBytes - a.totalBytes)
}

function readInventoryJSON() {
	if (fileImportInput.files.length <= 0) return;
	hideFileSelection();
	showItemList();

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
				uniqueAssetManifest: [],
				assets: 0,
				totalBytes: 0,
				uniqueBytes: 0,
				totalSize: "",
				location: item.path,
				thumbnail: item.thumbnailUri ? getAssetThumbnail(item.thumbnailUri) : null
			}
			itemResponse.assetManifest = itemResponse.assetManifest.map(obj => ({ hash: obj.hash, totalBytes: obj.bytes }));

			item.assetManifest.forEach((asset) => {
				const assetIsInArray = assets.some((obj) => obj.hash === asset.hash);
				itemResponse.assets++;
				itemResponse.totalBytes += asset.bytes;
				if (assetIsInArray) return;

				assets.push(asset);

				itemResponse.uniqueAssetManifest.push(asset);
				itemResponse.uniqueBytes += asset.bytes;
			})

			itemList.push(itemResponse);
			itemResponse.uniqueAssetManifest = itemResponse.uniqueAssetManifest.map(obj => ({ hash: obj.hash, totalBytes: obj.bytes }));

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
	td[3].textContent = item.uniqueAssetManifest.length;
	td[4].textContent = item.totalSize;
	const tbody = qs('#chart tbody');
	tbody.appendChild(clone);
}

function insertAssetElement(asset, isUnique) {
	let tbody;

	if (isUnique) {
		tbody = qs('#inspect-unique-assets tbody');
	} else {
		tbody = qs('#inspect-all-assets tbody');
	}
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

function getAssetThumbnail(uri) {
	return `https://assets.resonite.com/${uri.replace("resdb:///", "").replace(".webp", "")}`;
}

function hideFileSelection() {
	qs(`#file-selection`).classList.add("hidden");
}

function showInspectionPage() {
	qs('#chart').classList.add("hidden");
	qs(`#item-inspection`).classList.remove("hidden");
	qs(`#item-inspection-nav`).classList.remove("hidden");
}

function showItemList() {
	qs('#chart').classList.remove("hidden");
	qs(`#item-inspection`).classList.add("hidden");
	qs(`#item-inspection-nav`).classList.add("hidden");
}