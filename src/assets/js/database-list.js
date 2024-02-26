import {buildOptionsForm} from "./database-options-manager.js";
import {startLoading, stopLoading} from "./loading.js";
import {buildImportFilemakerForm} from "./import-filemaker.js";
import {download} from "./filesystem.js";

/**
 * Represents a list of items in a database.
 *
 * @class
 */
export default class DatabaseList {
    function

    /**
     * Constructor for creating a new instance of the class.
     *
     * @param {string} id - The ID of the instance.
     *
     * @return {void}
     */
    constructor(id) {
        startLoading({fullscreen: true});
        this.list = $(".list");
        this.items = [];
        this.id = id;
        this.getListHeader().then(async ({name, location, po, image, options, posted}) => {
            if (image !== "") {
                img.attr('src', image);
                img.css("border-radius", "12px");
            }
            title.html(name);
            subtitle.html(`${location} - ${po}`).css("display", "");
            backButton.css("display", "");
            this.list.html("");
            $(".pagination").html("");
            $("#search").val("");
            await this.loadView("", true);
            this.list.empty();
            if (this.items.length === 0) {
                this.list.append(await buildImportFilemakerForm())
            } else {
                if (options.length === 0 || options.layout === null || options.layout === "") {
                    this.list.append(await buildOptionsForm(id));
                }
            }

            $(document).trigger("load")
        }).then(() => stopLoading());
    }

    /**
     * Loads and displays a view based on the given query.
     *
     * @param {string} query - The query to fetch data and build the view.
     * @param {boolean} [force=false] - Flag that determines whether to force fetching the data and rebuilding the view, even if the data hasn't changed.
     *
     * @return {Promise<void>} - A promise that resolves once the view is loaded and displayed.
     */
    async loadView(query, force = false) {

        const newList = await this.getListItems(query);
        if (force || newList !== this.items) {
            this.items = newList;
            await this.buildList()
        }
    }

    /**
     * Performs a search using the given query.
     *
     * @param {string} query - The search query.
     * @return {Promise<Array>} - A promise that resolves to an array of items matching the search query.
     */
    async search(query) {
        await this.loadView(query, true);
        return this.items;
    }

    /**
     * Retrieves a list of items for the location.
     *
     * @param {string} [query=""] - The optional query string to filter the list of items.
     * @returns {Promise<Array>} - A promise that resolves with an array of items.
     *
     * @example
     * getListItems("book");
     * // Returns a promise that resolves with an array of book items.
     *
     * @example
     * getListItems();
     * // Returns a promise that resolves with the complete list of items.
     */
    async getListItems(query = "") {
        const url = `${baseURL}/api/location/${this.id}/`;
        let newList = await $.ajax({url: url, method: "GET"});
        newList = newList["results"]["items"];
        if (query !== "") {
            newList = newList.filter((item) => item["name"].toLowerCase().includes(query.toLowerCase()));
        }
        return newList;
    }

    /**
     * Builds a list of items.
     *
     * If the list of items is empty, it calls the `buildImportFilemakerForm` function
     * and sets the HTML content of `this.list` to the result of the function call.
     * If the list of items is not empty, it clears the HTML content of `this.list` and
     * adds HTML elements for each item in `this.items`.
     *
     * @returns {Promise<void>} A promise that resolves when the list is built.
     */
    async buildList() {
        this.list.html("");
        console.log(this.items)
        this.items.forEach((item) => {
            const listItem = $("<div>").addClass("list-item");
            const name = $("<h3>").html(item["name"]);
            const location = $("<p>").html(item["location"]);
            listItem.append(name, location);
            this.list.append(listItem);
        });
    }

    buildItemizedList() {
    }

    /**
     * Retrieves the header information for the specified location.
     *
     * @return {Promise<Object>} - A promise that resolves to an object containing the header information.
     */
    async getListHeader() {
        const url = `${baseURL}/api/location/${this.id}/?headings=true`;
        const json = await $.ajax({url: url, method: "GET"});
        return {name: json["name"], location: json["location"], po: json["po"], image: json["image"], options: json["options"], posted: new Date(json["post_date"])};
    }

    exportCSV() {
        const items = this.items;
        const csv = items.map(item => {
            return Object.values(item).join(",");
        }).join("\n");
        download("export.csv", csv);

    }
}


/*
const list = $(".list");
let loadedListItems = [];
let currentId = "";
let currentQuery = "";
backButton.on('click', () => loadView("", "", true));
loadView("", "", true);
setInterval(async () => await loadView(currentId, currentQuery), 30 * 1000);

async function loadList(id = "", query = "") {
    currentQuery = query;
    currentId = id;
    if (!id) {
        return await loadDatabaseList(query);
    } else {
        return await loadDatabase(id, query);
    }

}


$("#search").on("keyup", async (e) => {
    await loadView(currentId, e.target.value, true);
});


async function loadDatabase(id = "", query = "") {
    const {_, name, location, po, image, options, posted} = await getListHeader(id);
    console.log(id, name, location, po, image, options, posted);

    if (image !== "") {
        img.attr('src', image);
        img.css("border-radius", "12px");
    }
    title.html(name);
    subtitle.html(`${location} - ${po}`).css("display", "");
    backButton.css("display", "");
    list.html("");
    $(".pagination").html("");
    $("#search").val("");

    loadedListItems = [];

    return [];
}



 */