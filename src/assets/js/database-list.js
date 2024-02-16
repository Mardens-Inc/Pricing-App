import Filemaker from "https://cdn.jsdelivr.net/gh/Mardens-Inc/Filemaker-API/js/Filemaker.js";

export default class DatabaseList {
    constructor(id) {
        this.list = $(".list");
        this.items = [];
        this.id = id;
        this.getListHeader().then(({name, location, po, image, options, posted}) => {
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
        });
        this.loadView("", true);
    }

    async loadView(query, force = false) {

        const newList = await this.getListItems(query);
        if (force || newList !== this.items) {
            this.items = newList;
            this.buildList()
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

    buildList() {
        if (this.items.length === 0) {
            this.buildImportFilemakerForm()
            return;
        }
        this.list.html("");
        this.items.forEach((item) => {
            const listItem = $("<div>").addClass("list-item");
            const name = $("<h3>").html(item["name"]);
            const location = $("<p>").html(item["location"]);
            listItem.append(name, location);
            this.list.append(listItem);
        });
    }

    async buildImportFilemakerForm() {
        const html = $(await $.ajax({url: "assets/html/import-filemaker-form.html", method: "GET"}));
        const filemaker = new Filemaker("https://lib.mardens.com/fmutil", "admin", "19MRCC77!");
        const databases = await filemaker.getDatabases();
        for (const database of databases) {
            const item = $(`
                <input type="radio" id="filemaker-database-${database}" name="filemaker-database" value="${database}">
                <label for="filemaker-database-${database}" class="list-item">${database.replace(/-/g, " ")}</label>
            `)
            html.find("#filemaker-databases .list").append(item);
        }
        html.find("#filemaker-databases input").on('change', async (e) => {
            html.find("#filemaker-databases button[type='submit']").prop("disabled", false);
        });
        html.find("#filemaker-databases").on('submit', async (e) => {
            const database = html.find('input[name="filemaker-database"]:checked').val();
            if (database === undefined) {
                console.error("No database selected");
                return;
            }
        });

        html.find("#filemaker-credentials").on("submit", async (e) => {
            const username = html.find("#filemaker-username").val();
            const password = html.find("#filemaker-password").val();
        });


        this.list.html(html);
    }

    buildItemizedList() {
    }


    async getListHeader() {
        const url = `${baseURL}/api/location/${this.id}/?headings=true`;
        const json = await $.ajax({url: url, method: "GET"});
        return {name: json["name"], location: json["location"], po: json["po"], image: json["image"], options: json["options"], posted: json["posted_date"]};
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