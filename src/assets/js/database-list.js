import {buildImportFilemakerForm} from "./import-filemaker.js";
import {buildOptionsForm} from "./database-options-manager.js";
import {startLoading, stopLoading} from "./loading.js";

export default class DatabaseList {
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
            if (options.length === 0 || options.layout === null || options.layout === "") {
                this.list.html(await buildOptionsForm(id));
            } else {
                await this.loadView("", true);
            }
        }).then(() => stopLoading());
    }

    async loadView(query, force = false) {

        const newList = await this.getListItems(query);
        if (force || newList !== this.items) {
            this.items = newList;
            await this.buildList()
        }
    }

    async search(query) {
        await this.loadView(query, true);
        return this.items;
    }

    async getListItems(query = "") {
        const url = `${baseURL}/api/location/${this.id}/`;
        let newList = await $.ajax({url: url, method: "GET"});
        newList = newList["results"]["items"];
        if (query !== "") {
            newList = newList.filter((item) => item["name"].toLowerCase().includes(query.toLowerCase()));
        }
        return newList;
    }

    async buildList() {
        if (this.items.length === 0) {
            this.list.html(await buildImportFilemakerForm());
            return;
        }
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


    async getListHeader() {
        const url = `${baseURL}/api/location/${this.id}/?headings=true`;
        const json = await $.ajax({url: url, method: "GET"});
        return {name: json["name"], location: json["location"], po: json["po"], image: json["image"], options: json["options"], posted: new Date(json["post_date"])};
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