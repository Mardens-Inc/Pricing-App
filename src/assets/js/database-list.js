const list = $(".list");
let loadedListItems = [];
let currentId = "";
loadList();

async function loadList(id = "", query = "") {
    if (!id) {
        await loadDatabaseList(query);
    } else {
        currentId = id;
    }

    loadLabels();
}


$("#search").on("keyup", async (e) => {
    await loadList(currentId, e.target.value);
});


async function loadDatabaseList(query = "") {
    list.html("");

    const url = "https://pricing-new.mardens.com/api/locations/all";
    try {
        loadedListItems = await $.ajax({url: url, method: "GET"});
        if (query !== "") {
            loadedListItems = loadedListItems.filter((item) => {
                return item["name"].toLowerCase().includes(query.toLowerCase()) || item["location"].toLowerCase().includes(query.toLowerCase()) || item["po"].toLowerCase().includes(query.toLowerCase());
            });
        }
        $(".pagination").pagination({
            dataSource: loadedListItems,
            autoHideNext: false,
            autoHidePrevious: false,
            pageSize: 10,
            pageRange: 1,

            callback: (data, pagination) => {
                console.log(data, pagination);

                list.html("");
                data.forEach((item) => {


                    let i = $(`
                        <div class="list-item">
                            <img src="${item["image"]===""?"/assets/images/icon.png":item["image"]}" alt="">
                            <span class="title">${item["name"]}<span class="extra">${item["location"]} - ${item["po"]}</span></span>
                            
                        </div> `);
                    const editButton = $(`<button class="edit-list-button" title="Edit product"><img src="assets/images/icons/edit.svg" alt=""></button>`);
                    const moreButton = $(`<button class="more-options" data-title="More Options" tabindex="0"><img src="assets/images/icons/more.svg" alt=""></button>`);

                    moreButton.on('click', (e) => {
                        openDropdown(moreButton, {
                            "Edit": () => {
                                console.log("Edit")
                            },
                            "Delete": () => {
                                console.log("Delete")
                            }
                        })
                    });

                    i.append(editButton);
                    i.append(moreButton);

                    list.append(i);
                });
                loadLabels();

            }
        })
    } catch (e) {
        console.error("Unable to fetch data from the server\n", url, e);
    }
}