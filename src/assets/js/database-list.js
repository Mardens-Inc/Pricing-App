const list = $(".list");
loadList();

async function loadList(id = "") {
    if (!id) {
        await loadDatabaseList();
    } else {

    }


    loadLabels();
}


async function loadDatabaseList() {
    list.html("");

    const url = "https://pricing-new.mardens.com/api/locations/";
    try {
        const json = await $.ajax({url: url, method: "GET"});
        console.log(json)
        const items = json.items;
        for (let i = 0; i < items.length; i++) {

            let item = $(`
                        <div class="list-item">
                            <img src="${items[i]["0"]["image"]}" alt="">
                            <span class="title">${items[i]["name"]}</span>
                        </div> `);
            const editButton = $(`<button class="edit-list-button" title="Edit product"><img src="assets/images/icons/edit.svg" alt=""></button>`);
            const moreButton = $(`<button class="more-options" data-title="More Options" tabindex="0"><img src="assets/images/icons/more.svg" alt=""></button>`);

            moreButton.on('click', (e)=> {
                openDropdown(moreButton, {
                    "Edit": () => {
                        console.log("Edit")
                    },
                    "Delete": () => {
                        console.log("Delete")
                    }
                })
            });

            item.append(editButton);
            item.append(moreButton);

            list.append(item);
        }
    } catch (e) {
        console.error("Unable to fetch data from the server\n", url, e);
    }
}