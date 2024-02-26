import DatabaseList from "./database-list.js";
import DirectoryList from "./directory-list.js";
import {startLoading, stopLoading} from "./loading.js";


$("#edit-button").css('display', 'none');
const directory = new DirectoryList();
let database = null;
if (window.localStorage.getItem("loadedDatabase") !== null) {
    database = new DatabaseList(window.localStorage.getItem("loadedDatabase"));
    $("#edit-button").css('display', "");
} else {
    startLoading({fullscreen: true})
    directory.loadView("", true).then(() => stopLoading());
}
$(directory).on("loadExternalView", (event, id) => {
    database = new DatabaseList(id);
    window.localStorage.setItem("loadedDatabase", id);
    $("#edit-button").css('display', "");
});
$(directory).on("unloadExternalView", (event, id) => {
    database = null;
    $("#edit-button").css('display', 'none');
    window.localStorage.removeItem("loadedDatabase");
});
$(document).on("search", async (event, data) => {
    let results = [];
    if (database !== null) {
        results = await database.search(data);
    } else {
        results = await directory.search(data);
    }
});