import DatabaseList from "./database-list.js";
import DirectoryList from "./directory-list.js";
import {startLoading, stopLoading} from "./loading.js";
import {loadSettings, openSettings} from "./settings.js";

loadSettings();

const list = $("main > .list")
resetListElement()
const editButton = $("#edit-button");
const newButton = $("#new-button");
const exportButton = $("#export-button");

$("#settings-button").on("click", async () => {
    await openSettings();
});


editButton.css('display', 'none');
exportButton.css('display', 'none');


const directory = new DirectoryList();
/**
 * @type {DatabaseList|null}
 */
let database = null;
if (window.localStorage.getItem("loadedDatabase") !== null) {
    database = new DatabaseList(window.localStorage.getItem("loadedDatabase"));
    database.load();
    editButton.css('display', "");
    exportButton.css('display', "");
    newButton.css('display', 'none');
} else {
    startLoading({fullscreen: true})
    directory.loadView("", true).then(() => stopLoading())
}
$(directory).on("loadExternalView", async (event, id) => {
    resetListElement()
    database = new DatabaseList(id);
    await database.load();
    window.localStorage.setItem("loadedDatabase", id);
    editButton.css('display', "");
    exportButton.css('display', "");
    newButton.css('display', 'none');
});
$(directory).on('loadEdit', async (event, id) => {
    database = new DatabaseList(id);
    await database.load();
    window.localStorage.setItem("loadedDatabase", id);
    editButton.css('display', "");
    exportButton.css('display', "");
    newButton.css('display', 'none');
    resetListElement()
    await database.edit();
});
$(directory).on("unloadExternalView", (event, id) => {
    resetListElement()
    database = null;
    editButton.css('display', 'none');
    exportButton.css('display', "none");
    newButton.css('display', '');
    window.localStorage.removeItem("loadedDatabase");
});

$(document).on("search", async (event, data) => {
    if (database !== null) {
        await database.search(data);
    } else {
        resetListElement()
        await directory.search(data);
    }
});

editButton.on("click", async () => {
    resetListElement()
    if (database !== null) {
        await database.edit();
    }
});

newButton.on("click", async () => {
    await DatabaseList.create();
    resetListElement()
});

exportButton.on("click", async () => {
    if (database !== null) {
        await database.exportCSV();
    }
});


function resetListElement() {
    if (list.hasClass("row")) {
        list.addClass('col')
        list.removeClass('row')
    }
}

