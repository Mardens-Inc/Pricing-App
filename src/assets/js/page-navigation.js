import auth from "./authentication.js";
import {isDedicatedClient} from "./crossplatform-utility.js";
import DatabaseList from "./database-list.js";
import DirectoryList from "./directory-list.js";
import {startLoading, stopLoading} from "./loading.js";
import {alert, confirm} from "./popups.js";
import {loadSettings, openSettings} from "./settings.js";
import {getCurrentVersion} from "./updater.js";
import {colors} from "./database-options-manager.js";

window.alert = alert;
window.confirm = confirm;


const list = $("main > .list");
resetListElement();
const editButton = $("#edit-button");
const newButton = $("#new-button");
const exportButton = $("#export-button");

if (isDedicatedClient) {
    getCurrentVersion().then(version => {
        if (version === "web-client") {
            subtitle.html(`Web Client`);
        } else {
            subtitle.html(`v${version}`);
        }
    });
}

exportButton.hide();

$("#settings-button").on("click", async () => {
    await openSettings();
});


editButton.css("display", "none");
exportButton.css("display", "none");

const directory = new DirectoryList();
/**
 * @type {DatabaseList|null}
 */
let database = null;
$(window).on("load", async () => {
    try {
        if (isDedicatedClient) {
            await loadSettings();
        }
    } catch (e) {
        console.error(e);
    }
    if (window.localStorage.getItem("loadedDatabase") !== null) {
        try {
            database = new DatabaseList(window.localStorage.getItem("loadedDatabase"));
            await database.load();
            editButton.css("display", "");
            exportButton.css("display", "");
            newButton.css("display", "none");
            if (window.localStorage.getItem("page") === "settings") {
                resetListElement();
                await database.edit();
            }
        } catch (e) {
            console.error(e);
            startLoading({fullscreen: true});
            await directory.loadView("", true);
            stopLoading();
        }
    } else {
        try {

            startLoading({fullscreen: true});
            await directory.loadView("", true);
            stopLoading();
        } catch (e) {
            console.error(e);
        }
    }
    setTimeout(() => {
        askToLogin();
        $(auth).on("log-out", () => askToLogin());
    }, 1000);
});
$(directory).on("loadExternalView", async (event, id) => {
    resetListElement();
    database = new DatabaseList(id);
    window.localStorage.setItem("loadedDatabase", id);
    await database.load();
    editButton.css("display", "");
    exportButton.css("display", "");
    newButton.css("display", "none");
    $(document).trigger("finishedLoadingExternalView", [id]);
});
$(directory).on("loadEdit", async (event, id) => {
    database = new DatabaseList(id);
    window.localStorage.setItem("loadedDatabase", id);
    await database.load();
    editButton.css("display", "");
    exportButton.css("display", "");
    newButton.css("display", "none");
    resetListElement();
    await database.edit();
});
$(directory).on("unloadExternalView", (event, id) => {
    resetListElement();
    database = null;
    editButton.css("display", "none");
    exportButton.css("display", "none");
    newButton.css("display", "");
    window.localStorage.removeItem("loadedDatabase");
});

$(document).on("search", async (event, data) => {
    console.log("searching", data);
    if (database !== null) {
        await database.search(data);
    } else {
        resetListElement();
        await directory.search(data);
    }
});

editButton.on("click", async () => {
    resetListElement();
    if (database !== null) {
        await database.edit();
    }
});

newButton.on("click", async () => {
    await DatabaseList.create();
    resetListElement();
});

exportButton.on("click", async () => {
    if (database !== null) {
        await database.exportCSV();
    }
});


function resetListElement() {
    if (list.hasClass("row")) {
        list.addClass("col");
        list.removeClass("row");
    }
}

const colorDropdown = $("#page-color-dropdown-button")
    .on("click", e => {
        openDropdown(e.currentTarget, colors.reduce((acc, color) => {
            acc[color] = () => {
                colorDropdown.html(color);
                if (color === "No Color") {
                    localStorage.removeItem(`${window.localStorage.getItem("loadedDatabase")}-selected-color`);
                } else {
                    localStorage.setItem(`${window.localStorage.getItem("loadedDatabase")}-selected-color`, color);
                }
            };
            return acc;
        }, {}));
    });

$("#year-input-field input").on("input", e => {
    const value = e.currentTarget.value;
    localStorage.setItem(`${window.localStorage.getItem("loadedDatabase")}-selected-year`, value);
});

export function getSelectedYear() {
    return localStorage.getItem(`${window.localStorage.getItem("loadedDatabase")}-selected-year`) ?? "";
}

export function getSelectedColor() {
    return localStorage.getItem(`${window.localStorage.getItem("loadedDatabase")}-selected-color`) ?? "";
}

function askToLogin() {
    if (!auth.isLoggedIn /*&& window.localStorage.getItem("loginPrompt") === null*/ && isDedicatedClient) {
        // window.localStorage.setItem("loginPrompt", true);
        $("#login-button").trigger("click");
    }
}