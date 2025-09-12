const qsa = (selector) => document.querySelectorAll(selector);
const qs = (selector) => document.querySelector(selector);

let resonite;
let fileList = [];

const fileImportInput = qs("#json-importer");
const itemAssetList = qs("#item-asset-list");

fileImportInput.addEventListener("change", readInventoryJSON);

function openItemInspectionPage(item_id) {
	const tbodyAll = qs("#inspect-all-assets tbody");
	const tbodyUnique = qs("#inspect-unique-assets tbody");
	tbodyAll.innerHTML = "";
	tbodyUnique.innerHTML = "";
	const fileListItem = fileList.find((listItem) => listItem.id == item_id);
	fileListItem.assetManifest = sortByByteSize(fileListItem.assetManifest);
	fileListItem.uniqueAssetManifest = sortByByteSize(fileListItem.uniqueAssetManifest);

	fileListItem.assetManifest.forEach((elem) => insertAssetElement(elem, false));
	fileListItem.uniqueAssetManifest.forEach((elem) => insertAssetElement(elem, true));

	qs(`#inspect-name`).innerText = fileListItem.name;
	qs(`#inspect-location`).innerText = fileListItem.location;
	qs(`#inspect-total-assets`).innerText = fileListItem.assets;
	qs(`#inspect-unique-assets`).innerText = fileListItem.uniqueAssetManifest.length;
	qs(`#inspect-total-size`).innerText = fileListItem.totalBytesString;
	qs(`#inspect-real-size`).innerText = fileListItem.uniqueBytesString;
	qs(`#item-inspection .thumbnail img`).src = fileListItem.thumbnail;
	showInspectionPage();
}

function sortByByteSize(arr) {
	return arr.sort((a, b) => b.totalBytes - a.totalBytes);
}

function readInventoryJSON() {
	if (fileImportInput.files.length <= 0) return;
	hideFileSelection();
	showItemList();

	let reader = new FileReader();
	reader.addEventListener("load", () => {
		resonite = new Resonite(JSON.parse(reader.result));
		resonite.itemList.forEach(insertItemElement);
		fileList = resonite.itemList;
	});
	reader.readAsText(fileImportInput.files[0]);
}

function insertItemElement(item) {
	const template = qs("#item-listing-template");
	const clone = template.content.cloneNode(true);
	let td = clone.querySelectorAll("td");
	td[0].innerHTML = `<a onclick="openItemInspectionPage('${item.id}')" href="#">${item.name}</a>`;
	td[1].textContent = item.id;
	td[2].textContent = item.assets;
	td[3].textContent = item.uniqueAssetManifest.length;
	td[4].textContent = item.totalBytesString;
	const tbody = qs("#chart tbody");
	tbody.appendChild(clone);
}

function insertAssetElement(asset, isUnique) {
	let tbody;

	if (isUnique) {
		tbody = qs("#inspect-unique-assets tbody");
	} else {
		tbody = qs("#inspect-all-assets tbody");
	}
	const template = qs("#asset-listing-template");
	const clone = template.content.cloneNode(true);
	let td = clone.querySelectorAll("td");
	td[0].textContent = asset.hash;
	td[1].textContent = asset.totalBytesString;
	tbody.appendChild(clone);
}

function hideFileSelection() {
	qs(`#file-selection`).classList.add("hidden");
}

function showInspectionPage() {
	qs("#chart").classList.add("hidden");
	qs(`#chart-search`).classList.add("hidden");
	qs(`#item-inspection`).classList.remove("hidden");
	qs(`#item-inspection-nav`).classList.remove("hidden");
}

function showItemList() {
	qs("#chart").classList.remove("hidden");
	qs(`#chart-search`).classList.remove("hidden");
	qs(`#item-inspection`).classList.add("hidden");
	qs(`#item-inspection-nav`).classList.add("hidden");
}

function search() {
	const searchTerm = qs("#search-input").value.toLowerCase();
	const isMessage = qs(".filter #isMessage").checked;
	const isForPatrons = qs(".filter #isPatreon").checked;
	searchList = resonite.getFilteredList({ name: searchTerm, isMessage, isForPatrons });
	displayItemList(searchList);
}

function displayItemList(list) {
	const tbody = qs("#chart tbody");
	tbody.innerHTML = "";
	list.forEach(insertItemElement);
}
