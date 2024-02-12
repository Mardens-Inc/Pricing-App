const list = $(".list");
let loadedListItems = [];
let currentId = "";
let currentQuery = "";
loadView("", "", true);

async function loadList(id = "", query = "") {
    currentQuery = query;
    currentId = id;
    if (!id) {
        return await loadDatabaseList(query);
    } else {
    }

}


$("#search").on("keyup", async (e) => {
    await loadView(currentId, e.target.value, true);
});


async function loadDatabaseList(query = "") {

    const url = "https://pricing-new.mardens.com/api/locations/all";
    try {
        let newList = await $.ajax({url: url, method: "GET"});
        if (query !== "") {
            newList = newList.filter((item) => {
                return item["name"].toLowerCase().includes(query.toLowerCase()) || item["location"].toLowerCase().includes(query.toLowerCase()) || item["po"].toLowerCase().includes(query.toLowerCase());
            });
        }
        return newList;
    } catch (e) {
        console.error("Unable to fetch data from the server\n", url, e);
    }
}

function buildPagination() {
    try {

        $(".pagination").pagination({
            dataSource: loadedListItems,
            autoHideNext: false,
            autoHidePrevious: false,
            pageSize: 10,
            pageRange: 1,

            callback: (data, pagination) => {
                list.html("");
                data.forEach((item) => {


                    let i = $(`
                        <div class="list-item">
                            <img src="${item["image"] === "" ? "/assets/images/icon.png" : item["image"]}" alt="">
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
        console.error(`Unable to build pagination\nLoaded List: ${loadedListItems}\n`, e);
    }
}

const refreshTimer = setInterval(async () => await loadView(currentId, currentQuery), 30 * 1000);

async function loadView(id, query, force = false) {
    const newList = await loadList(id, query);
    if (force || newList !== loadedListItems) {
        loadedListItems = newList;
        buildPagination();
    }
}


import Voice from "./Voice.js";

$("#voice-search-button").on('click', () => {

    let voice = new Voice();
    if (voice.unsupported) {
        alert(`Your browser does not support voice recognition`);
        return;
    }
    const button = $("#voice-search-button");
    if (button.hasClass("primary")) {
        button.removeClass("primary");
        voice.stop();
        return;
    }
    button.addClass("primary");
    $(voice).on("interim", async (event, transcript) => {
        console.log("Interim: " + transcript);
        $("#search").val(transcript);
        await loadView(currentId, transcript);
    });
    $(voice).on("result", async (event, transcript) => {
        button.removeClass("primary");
        voice.stop();
    });

    voice.start();
})