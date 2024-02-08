import List from './element-list.js';

const list = $(".list");
loadList();

async function loadList(id = "") {
    if (!id) {
        await loadDatabaseList();
    } else {

    }


    loadLabels();
    loadDropdown();
}


async function loadDatabaseList() {
    list.html("");

    const url = "http://pricing.local/api/locations/";
    try {
        const json = await $.ajax({url: url, method: "GET"});
        console.log(json)
        const items = json.items;
        for (let i = 0; i < items.length; i++) {
            let item = new List(`https://pricing.mardens.com/icons/${items[i].image}`, items[i].name, true, [
                {
                    name: "Edit",
                    action: () => {
                        console.log("Edit");
                    }
                },
                {
                    name: "Delete",
                    action: () => {
                        console.log("Delete");
                    }
                }
            ]);
            list.append(item);
        }
    } catch (e) {
        console.error("Unable to fetch data from the server\n", url, e);
    }
}