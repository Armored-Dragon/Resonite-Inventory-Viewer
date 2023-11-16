let resonite_item_list = [];
let asset_list = []; // An "Asset" is a linked asset per each item. One item can have lots of assets.
let total_bytes = 0;

// QOL functions
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);

// Elements
const file_import_input = qs("#file-import");
const item_list = qs("#file-browser .item-list");
const item_template = qs("#entry-template");

// Modal
const item_modal = qs("#item-info-modal");
const modal_name = qs("#item-info-modal [data-name]");
const modal_id = qs("#item-info-modal [data-id]");
const modal_size = qs("#item-info-modal [data-size]");
const modal_path = qs("#item-info-modal [data-path]");
const modal_assets = qs("#item-info-modal [data-assets]");
const modal_unique_assets = qs("#item-info-modal [data-unique-assets]");
const modal_message_item = qs("#item-info-modal [data-message-item]");
const modal_thumbnail = qs("#item-info-modal [data-thumbnail]");

const only_message_items_setting = qs("#only-message-items");
const search_setting = qs("#search");

// Event Listeners
file_import_input.addEventListener("change", newInventoryFile);
only_message_items_setting.addEventListener("change", filterChange);
search_setting.addEventListener("change", filterChange);

// Logic
function newInventoryFile() {
  // Show the file list
  qs("#file-selection-modal").classList.add("hidden");
  qs("#file-browser").classList.remove("hidden");

  // Get the file
  if (file_import_input.files.length <= 0) return;
  let reader = new FileReader();
  reader.addEventListener("load", () => handleFileContents(JSON.parse(reader.result)));
  reader.readAsText(file_import_input.files[0]);
}

function handleFileContents(inventory_json) {
  asset_list = []; // Reset the asset list
  item_list.innerHTML = ""; // Clear the asset list

  inventory_json.forEach(newInventoryEntry);

  // Calculate storage overview values
  qs("#total-used-space").innerText = `${(total_bytes / 1000000).toFixed(2)} MB`;
  qs(".storage-overview progress").value = total_bytes / 1000000000;
}

function filterChange() {
  let settings = {
    only_message_items: qs("#only-message-items").checked,
    search: search_setting.value.toLowerCase(),
  };

  let filtered_list = [];

  resonite_item_list.forEach((item) => {
    if (settings.only_message_items && !item.message_item) return;
    if (search && !item.name.toLowerCase().includes(settings.search)) return;

    filtered_list.push(item);
  });

  item_list.innerHTML = ""; // Clear the asset list

  filtered_list.forEach(addItemToView);
}

function newInventoryEntry(item) {
  let estimate_size = 0;
  let assets = 0;
  let unique_assets = 0;
  let thumbnail_url = "";

  // Get the linked assets of the item
  item.assetManifest.forEach((asset) => {
    const in_array = asset_list.some((obj) => obj.hash === asset.hash);
    assets++;

    if (!in_array) {
      asset_list.push(asset);
      estimate_size += asset.bytes;
      total_bytes += asset.bytes;
      unique_assets++;
    }
  });

  // Get the thumbnail
  if (item.thumbnailUri) thumbnail_url = `https://assets.resonite.com/${item.thumbnailUri.replace("resdb:///", "").replace(".webp", "")}`;

  // Format the list to allow the user to easily add additional filters
  const item_info = {
    name: item.name,
    directory: item.path,
    estimate_size: (estimate_size / 1000000).toFixed(2),
    assets: assets,
    unique_assets: unique_assets,
    message_item: item.tags.includes("message_item"),
    id: item.id,
    thumbnail_url: thumbnail_url,
  };

  resonite_item_list.push(item_info);
  addItemToView(item_info);
}
function addItemToView(item_info) {
  // Add the item to the view
  const item_html = item_template.content.cloneNode(true);

  // Edit the contents of the template
  item_html.querySelector(".thumbnail img").src = item_info.thumbnail_url;
  item_html.querySelector(".title").innerText = `${item_info.name}`;
  item_html.querySelectorAll(".info-blob .value")[0].innerText = `${item_info.estimate_size} MB`;
  item_html.querySelectorAll(".info-blob .value")[1].innerText = `${item_info.assets}`;
  item_html.querySelectorAll(".info-blob .value")[2].innerText = `${item_info.unique_assets}`;
  item_html.querySelector(".id").innerText = item_info.id;

  // Add to the list
  item_list.appendChild(item_html);

  item_list.children[item_list.children.length - 1].setAttribute("onclick", `showItemInModal(${JSON.stringify(item_info)})`);
}

function showItemInModal(item_info) {
  modal_name.innerText = item_info.name;
  modal_id.innerText = item_info.id;
  modal_size.innerText = `${item_info.estimate_size} MB`;
  modal_path.innerText = item_info.directory;
  modal_assets.innerText = item_info.assets;
  modal_unique_assets.innerText = item_info.unique_assets;
  modal_message_item.innerText = item_info.message_item;
  modal_thumbnail.src = item_info.thumbnail_url;

  item_modal.showModal();
}

function closeItemModal() {
  item_modal.close();
}
