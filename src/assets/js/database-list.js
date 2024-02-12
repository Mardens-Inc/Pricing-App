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

    async getListItems(query = "") {
        const url = `https://pricing-new.mardens.com/api/locations/${this.id}`;
        let newList = await $.ajax({url: url, method: "GET"});
        console.log(newList)
        if (query !== "") {
            newList = newList.filter((item) => item["name"].toLowerCase().includes(query.toLowerCase()));
        }
        return newList;
    }

    buildList() {
        this.list.html("");
        this.items.forEach((item) => {
            const listItem = $("<div>").addClass("list-item");
            const name = $("<h3>").html(item["name"]);
            const location = $("<p>").html(item["location"]);
            listItem.append(name, location);
            this.list.append(listItem);
        });
    }

    async getListHeader() {
        const url = `https://pricing-new.mardens.com/api/locations/${this.id}`;
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