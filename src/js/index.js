const dropZone = document.querySelector("#upload-area");
const inventoryFolderContainer = document.querySelector("#folder-container");
const inventoryItemContainer = document.querySelector("#item-container");
const dirContainer = document.querySelector("#dir-container");

const inventoryFolderTemplate = document.querySelector("#folder-listing-template");
const inventoryItemTemplate = document.querySelector("#item-listing-template");
const dirTemplate = document.querySelector("#dir-listing-template");

const itemsCountValue = document.querySelector("#item-count-value");
const assetsCountValue = document.querySelector("#asset-count-value");
const usedStorageCountValue = document.querySelector("#used-storage-value");

let resoniteItemTree = {};
let currentViewingDir = "Inventory";

let resonite = new Resonite();

["dragenter", "dragover"].forEach((evt) => {
	dropZone.addEventListener(evt, (e) => e.preventDefault());
});
dropZone.addEventListener("dragenter", () => {
	dropZone.classList.add("drag-active");
});
dropZone.addEventListener("drop", (e) => {
	e.preventDefault();
	dropZone.classList.remove("drag-active");
	const files = Array.from(e.dataTransfer.files);
	handleFiles(files[0]);
});
dropZone.addEventListener("dragleave", (e) => {
	if (!e.relatedTarget || !dropZone.contains(e.relatedTarget)) {
		dropZone.classList.remove("drag-active");
	}
});

function handleFiles(file) {
	let includesValidFile = false;

	if (file.type !== "application/json") {
		return;
	}

	const reader = new FileReader();
	reader.onload = function (event) {
		try {
			const jsonData = JSON.parse(event.target.result);
			resonite.loadInventoryFromJSON(jsonData);
			buildItemTree();
			showInventoryScreen();
		} catch (error) {
			console.error("Error parsing JSON:", error);
		}
	};

	reader.onerror = function () {
		console.error("Error reading file:", file.name);
	};

	reader.readAsText(file);

	if (includesValidFile == false) return;
}

function buildItemTree() {
	for (let a = 0; resonite.itemList.length > a; a++) {
		const item = resonite.itemList[a];
		const pathDir = item.path?.split("\\") || new Array();
		const lastKey = pathDir[pathDir.length - 1];
		let currentWorkingDir = resoniteItemTree;

		// No path, or invalid path.
		if (pathDir.length === 0) {
			if (!resoniteItemTree["Unknown"]) {
				resoniteItemTree["Unknown"] = {};
			}
			resoniteItemTree["Unknown"][item.id] = item;
			continue;
		}

		// Get the reference of the object in the resoniteItemTree.
		for (let b = 0; b < pathDir.length - 1; b++) {
			const pathDirKey = pathDir[b];

			// Recursively make the path to the object if required.
			if (!currentWorkingDir[pathDirKey]) {
				currentWorkingDir[pathDirKey] = {};
			}

			// Set the working path to the new path.
			currentWorkingDir = currentWorkingDir[pathDirKey];
		}

		// Make the item entry in the object.
		if (!currentWorkingDir[lastKey]) {
			currentWorkingDir[lastKey] = {};
		}

		currentWorkingDir[lastKey][item.id] = item;
	}
}

function showInventoryScreen() {
	const inventoryScreen = document.querySelector("#master-inventory");

	dropZone.classList.add("hidden");
	inventoryScreen.classList.remove("hidden");

	itemsCountValue.innerText = resonite.itemList.length;
	assetsCountValue.innerText = resonite.assetList.length;

	let usedStorage = 0;
	resonite.assetList.forEach((asset) => usedStorage += asset.bytes)
	usedStorageCountValue.innerText = resonite.bytesToMB(usedStorage);

	displaySubfolderInInventoryScreen(resoniteItemTree["Inventory"]);
}

function displaySubfolderInInventoryScreen(obj) {
	inventoryFolderContainer.innerHTML = "";
	inventoryItemContainer.innerHTML = "";
	dirContainer.innerHTML = "";

	let items = [];
	let folders = [];

	for (let a = 0; Object.keys(obj).length > a; a++) {
		const itemKey = Object.keys(obj)[a];
		const target = obj[itemKey];

		if (isItemTreeEntryAFolder(target)) {
			folders.push(itemKey);
			continue;
		}

		items.push(target);
	}

	folders.forEach((folderEntry) => {
		const clone = document.importNode(inventoryFolderTemplate.content, true);
		clone.querySelector("span").innerText = folderEntry;
		clone.querySelector("span").parentElement.addEventListener("click", () => {
			deeperDir(folderEntry);
		});
		inventoryFolderContainer.appendChild(clone);
	});

	items.forEach((itemEntry) => {
		const clone = document.importNode(inventoryItemTemplate.content, true);
		clone.querySelector(".thumbnail img").src = itemEntry.thumbnail;
		clone.querySelector(".title").innerText = itemEntry.name;
		inventoryItemContainer.appendChild(clone);
	});

	const dirFolders = currentViewingDir.split(".");

	dirFolders.forEach((dir, index) => {
		const clone = document.importNode(dirTemplate.content, true);
		clone.querySelector("span").innerText = dir;
		clone.querySelector("span").parentElement.addEventListener("click", () => {
			const subset = dirFolders.slice(0, index + 1);
			const joinedPath = subset.join(".");
			const reference = getObjectRef(joinedPath);
			currentViewingDir = joinedPath;
			displaySubfolderInInventoryScreen(reference);
		});

		dirContainer.appendChild(clone);
		const newDiv = document.createElement("div");
		newDiv.innerText = "/";
		dirContainer.appendChild(newDiv);
	});
}

function isItemTreeEntryAFolder(obj) {
	const isValidationTokensObject = typeof obj.diffValidationTokens === "object";
	const isValidationTokensArray = Array.isArray(obj.diffValidationTokens);

	if (isValidationTokensObject && isValidationTokensArray) {
		return false;
	}

	return true;
}

function deeperDir(value) {
	currentViewingDir += `.${value}`;
	const targetObj = getObjectRef(currentViewingDir);
	displaySubfolderInInventoryScreen(targetObj);
}

function shallowerDir() {
	let directorySplit = currentViewingDir.split(".");
	directorySplit.pop();
	currentViewingDir = directorySplit.join(".");
	const targetObj = getObjectRef(currentViewingDir);
	displaySubfolderInInventoryScreen(targetObj);
}

function getObjectRef(dotNotation) {
	const pathDir = dotNotation.split(".");
	const lastKey = pathDir[pathDir.length - 1];
	let currentWorkingDir = resoniteItemTree;

	// Get the reference of the object in the resoniteItemTree.
	for (let b = 0; b < pathDir.length - 1; b++) {
		const pathDirKey = pathDir[b];

		// Recursively make the path to the object if required.
		if (!currentWorkingDir[pathDirKey]) {
			currentWorkingDir[pathDirKey] = {};
		}

		// Set the working path to the new path.
		currentWorkingDir = currentWorkingDir[pathDirKey];
	}

	// Make the item entry in the object.
	if (!currentWorkingDir[lastKey]) {
		currentWorkingDir[lastKey] = {};
	}

	return currentWorkingDir[lastKey];
}
