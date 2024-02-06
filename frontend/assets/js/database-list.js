import List from './element-list.js';

const list = $(".list");
loadList();

function loadList(id = "") {
    if (!id) {
        loadDatabaseList();
    } else {

    }


    loadLabels();
    loadDropdown();
}


function loadDatabaseList() {
    list.html("");
    for(let i = 0; i < 10; i++) {
        let item = new List("https://pricing.mardens.com/icons/fd.png", "Database " + (i + 1), true, [
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
}