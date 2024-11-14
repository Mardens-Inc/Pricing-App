import auth from "./authentication.js";
import {buildInventoryingFormWithQuantity} from "./database-inventorying-with-quantity.js";
import {buildInventoryingForm} from "./database-inventorying.js";
import {buildOptionsForm} from "./database-options-manager.js";
import {download} from "./filesystem.js";
import {getHistory} from "./history.js";
import {buildImportFilemakerForm} from "./import-filemaker.js";
import {startLoading, stopLoading} from "./loading.js";
import {deleteRecord} from "./location.js";
import {alert, confirm, openPopup} from "./popups.js";
import {getSelectedColor, getSelectedYear} from "./page-navigation.js";

/**
 * Represents a list of items in a database.
 *
 * @class
 */
export default class DatabaseList {
    function;

    /**
     * Constructor for creating a new instance of the class.
     *
     * @param {string|null} id - The ID of the instance.
     *
     * @return {void}
     */
    constructor(id) {
        this.list = $(".list");
        this.list.empty();
        this.items = [];
        this.id = id;
    }

    static async create() {
        if (!auth.isLoggedIn) return;
        const db = new DatabaseList(null);
        db.list.empty();
        db.list.append(await buildOptionsForm(null, async () => {
            window.location.reload();
        }));
        $(document).trigger("load");
    }

    async load() {
        startLoading({fullscreen: true});
        const {name, location, po, image, options, posted} = await this.getListHeader();
        if (image !== "") {
            img.attr("src", image);
            img.css("border-radius", "12px");
        } else {
            img.attr("src", "assets/images/icon.svg");
        }
        this.options = options;


        $("#year-input-field").css("display", options["print-form"]["show-year-dropdown"] ? "" : "none")
            .find('input').val(+getSelectedYear())
        $("#page-color-dropdown-button").css("display", options["print-form"]["show-color-dropdown"] ? "" : "none")
            .find("span").html(getSelectedColor() || "Color");


        title.html(name);
        subtitle.html(`${location} - ${po}`).css("display", "");
        backButton.css("display", "");
        backButton.on('click', () => {
            $("#year-input-field").css("display", "none")
            $("#page-color-dropdown-button").css("display", "none")
        })
        this.list.html("");
        $(".pagination").html("");
        $("#search").val("");
        try {
            await this.loadView("", true);
        } catch (e) {
            console.error(e);
        }

        this.importing = false;
        if (this.id !== null) {
            if (this.items.length === 0) {
                this.importing = true;
                if (options.hasOwnProperty("from_filemaker")) {
                    if (auth.isLoggedIn && auth.getUserProfile().admin) {
                        this.list.append(await buildImportFilemakerForm());
                    } else {
                        alert("This database is empty, and you do not have permission to import data.<br>Please contact an administrator for assistance.", () => {
                            window.localStorage.removeItem("loadedDatabase");
                            window.location.reload();
                        });
                    }
                }
            } else {
                if (options.hasOwnProperty("from_filemaker")) {
                    await this.edit();
                }
            }
        }

        $(document).trigger("load");
        stopLoading();
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
            await this.buildList();
        }
    }

    /**
     * Performs a search using the given query.
     *
     * @param {string} query - The search query.
     * @return {Promise<Array>} - A promise that resolves to an array of items matching the search query.
     */
    async search(query) {
        if (!this.importing) {
            // $("#search").val(query);
            await this.loadView(query, true);
            $(document).trigger("load");
            if (this.options["voice-search"]) this.speakResult();
            return this.items;
        }
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
        if (this.id === null) return [];
        let newList = [];
        try {
            if (query !== null && query !== undefined && query !== "") {
                try {
                    const searchColumns = this.options.columns.filter(c => c.attributes.includes("search"));
                    const primaryKey = this.options.columns.filter(c => c.attributes.includes("primary"))[0];
                    query = query.toLowerCase().replace(/^0+/, ""); // convert to lowercase and remove leading zeros

                    const url = `${baseURL}/api/location/${this.id}/search`;
                    const searchQuery = {
                        "query": query,
                        "columns": searchColumns.map(c => c.real_name),
                        "limit": 100,
                        "offset": 0,
                        "asc": true,
                        "sort": primaryKey === undefined ? "id" : primaryKey.real_name
                    };

                    newList = await $.ajax({
                        url: url,
                        method: "POST",
                        data: JSON.stringify(searchQuery),
                        contentType: "application/json",
                        headers: {"Accept": "application/json"}
                    });
                    newList = newList["items"];
                } catch (e) {
                    console.error(e);
                    return [];
                }


            } else {
                const url = `${baseURL}/api/location/${this.id}/`;
                newList = await $.ajax({url: url, method: "GET"});
                newList = newList["results"]["items"];
            }
        } catch (e) {
            console.error(`Error fetching items for location ${this.id}`);
            console.error(e);
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
        if (this.options.columns === undefined) return;
        this.options.columns = this.options.columns.filter(c => c !== null && c !== undefined);
        const table = this.buildColumns();
        table.css("--columnSize", `${(1 / (this.options.columns.filter(i => i.visible).length + 1)) * 100}%`);
        const tbody = $("<tbody>");
        for (const item of this.items) {
            const tr = $(`<tr id='${item.id}' class='list-item'>`);
            let mp = null;
            let retail = null;
            let mpCategory = null;
            let dept = null;
            try {
                for (const column of this.options.columns) {
                    if (column.visible) {
                        const attributes = column.attributes ?? [];
                        let text = item[column.real_name] ?? "";
                        if (attributes.includes("price") || attributes.includes("mp")) {
                            try {
                                text = text.replace(/[^0-9.]/g, "");
                                text = text === "" ? "0" : text;
                                text = parseFloat(text).toFixed(2);

                                if (attributes.includes("mp")) {
                                    mp = text;
                                    try {

                                        if (this.options["mardens-price"] !== undefined && this.options["mardens-price"] !== null && this.options["mardens-price"].length > 0) {
                                            const all = this.options["mardens-price"].filter(m => m.column === "All")[0];
                                            const mpOption = this.options["mardens-price"].filter(m => m.column === column.real_name)[0] ?? all;
                                            if (mpOption !== undefined) {
                                                const mpValue = parseFloat(mpOption.mp);
                                                const priceValue = parseFloat(retail);
                                                const percent = mpOption.percent / 100;
                                                mp = text = (priceValue * (1 - percent)).toFixed(2);
                                            } else {
                                                mp = text = parseFloat(mp).toFixed(2);
                                            }
                                        } else {
                                            mp = text = parseFloat(mp).toFixed(2);
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }

                                if (attributes.includes("mp-category")) {
                                    mpCategory = text;
                                }

                                if (attributes.includes("price")) retail = text;

                                text = `$${text}`;
                            } catch (e) {
                                console.error(e);
                            }
                        } else if (attributes.includes("quantity")) {
                            text = text.replace(/[^0-9-]/g, "");
                            text = text === "" ? "0" : text;
                            text = parseInt(text);
                        }
                        if (attributes.includes("department") && this.options["print-form"]?.enabled && this.options["print-form"]?.department?.id === -1) {
                            const departmentDropdown = $(`
                                                <button id="department-dropdown-button-${item.id}" class="department-dropdown-button fill horizontal" style="height: 50px;">
                                                    <span class="fill horizontal" style="padding-right: 2rem">Department</span>
                                                    <i class="fa fa-chevron-down"></i>
                                                </button>
                                                `)
                                .on("click", e => {
                                    openDropdown(e.currentTarget, [{id: 0, name: "No Dept."}, {id: 1, name: "General"},
                                        {id: 2, name: "Clothing"}, {id: 3, name: "Furniture"}, {id: 4, name: "Grocery Taxable"},
                                        {id: 5, name: "Shoes"}, {id: 6, name: "Fabric"}, {id: 7, name: "Flooring/Carpet"},
                                        {id: 8, name: "Hardware"}, {id: 9, name: "Special Sales"},
                                        {id: 14, name: "Grocery Non-Taxable"}].reduce((acc, dept) => {
                                        acc[`${dept.id} - ${dept.name}`] = () => {
                                            departmentDropdown.html(dept.name);
                                            departmentDropdown.attr('data-dept', dept.id);
                                            departmentDropdown.attr('data-deptname', dept.name);
                                        };
                                        return acc;
                                    }, {}));
                                });
                            departmentDropdown.find("span").html(departmentDropdown.attr('data-deptname') ?? "Department")
                            const td = $("<td>").append(departmentDropdown);
                            for (const attribute of attributes) {
                                td.addClass(attribute);
                            }
                            tr.append(td);
                        } else {

                            const td = $("<td>").html(text === "" ? "-" : text);
                            for (const attribute of attributes) {
                                td.addClass(attribute);
                            }
                            tr.append(td);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
            const extra = $("<td></td>");
            extra.addClass("extra");
            const extraButton = $(`<button title="More Options..."><i class='fa fa-ellipsis-vertical'></i></button>`);
            let printButton = null;
            if (this.options["print-form"].percentages && Array.isArray(this.options["print-form"].percentages) && this.options["print-form"].percentages.length > 0) {
                for (const percentage of this.options["print-form"].percentages) {
                    const percentButton = $(`<button title="Print ${percentage}% Off"><span class="badge">${percentage}%</span></button>`);

                    percentButton.on("click", () => {
                        const printForm = this.options["print-form"];
                        const url = new URL(`https://pricetagger.mardens.com/api/`);
                        if (printForm.label !== undefined && printForm.label !== null && printForm.label !== "") {
                            url.searchParams.append("label", printForm.label);
                        }
                        if (printForm.year !== undefined && printForm.year !== null) {
                            url.searchParams.append("year", printForm.year.toString());
                        }
                        if (printForm.department !== undefined && printForm.department !== null && printForm.department !== "") {
                            url.searchParams.append("department", printForm.department.id);
                        }
                        if (printForm.color !== undefined && printForm.color !== null && printForm.color !== "") {
                            url.searchParams.append("color", printForm.color);
                        }
                        const deptartmentColumn = $(`#${item.id} td.department`);
                        if (dept !== null || deptartmentColumn) {
                            console.log(deptartmentColumn.val())
                            url.searchParams.append("department", dept);
                        }

                        if (printForm["show-price-label"]) {
                            url.searchParams.append("showPriceLabel", "")
                        }

                        url.searchParams.append("v", new Date().getTime())

                        const departmentDropdown = tr.find(`#department-dropdown-button-${item.id}`);
                        if (departmentDropdown && departmentDropdown.length > 0) {
                            const departmentId = departmentDropdown.attr('data-dept');
                            if (departmentId !== undefined && departmentId !== null)
                                url.searchParams.append("department", departmentId);
                        }

                        if (retail != null) {
                            url.searchParams.append("price", retail);
                            console.log(retail, percentage)
                            mp = parseFloat(retail).toFixed(2) * (1 - percentage / 100);
                            url.searchParams.append("mp", mp);
                        }
                        const printWindow = window.open(url.toString(), "PRINT", "height=400,width=600");
                    });
                    extra.append(percentButton);
                }
            } else {
                printButton = $(`<button title="Print"><i class='fa fa-print'></i></button>`);
                printButton.on("click", () => {
                    const printForm = this.options["print-form"];
                    const url = new URL(`https://pricetagger.mardens.com/api/`);
                    if (printForm.label !== undefined && printForm.label !== null && printForm.label !== "") {
                        url.searchParams.append("label", printForm.label);
                    }
                    if (printForm.year !== undefined && printForm.year !== null && printForm.year !== "") {
                        url.searchParams.append("year", printForm.year.toString());
                    }
                    if (printForm["show-year-dropdown"] && getSelectedYear() !== "") {
                        url.searchParams.append("year", getSelectedYear());
                    }
                    if (printForm.department !== undefined && printForm.department !== null && printForm.department !== "") {
                        url.searchParams.append("department", printForm.department.id);
                    }
                    if (printForm.color !== undefined && printForm.color !== null && printForm.color !== "") {
                        url.searchParams.append("color", printForm.color);
                    } else if (printForm["show-color-dropdown"] && getSelectedColor() !== "") {
                        url.searchParams.append("color", getSelectedColor());

                    }
                    if (dept !== null) {
                        url.searchParams.append("department", dept);
                    }

                    if (printForm["show-price-label"]) {
                        url.searchParams.append("showPriceLabel", "")
                    }

                    if (retail != null)
                        url.searchParams.append("price", retail);
                    if (mp != null)
                        url.searchParams.append("mp", mp);

                    url.searchParams.append("v", new Date().getTime())


                    const departmentDropdown = tr.find(`#department-dropdown-button-${item.id}`);
                    const deptartmentColumn = $(`#${item.id} td.department`);
                    if (dept !== null || (deptartmentColumn && departmentDropdown.length === 0)) {
                        dept = deptartmentColumn.text();
                        console.log(deptartmentColumn.text())
                        url.searchParams.append("department", dept);
                    }

                    if (departmentDropdown && departmentDropdown.length > 0) {
                        const departmentId = departmentDropdown.attr('data-dept');
                        if (departmentId !== undefined && departmentId !== null)
                            url.searchParams.append("department", departmentId);
                    }

                    const printWindow = window.open(url.toString(), "PRINT", "height=400,width=600");
                });
            }


            const showExtraButton = auth.isLoggedIn;
            extraButton.on("click", async () => {
                const itemHistory = await getHistory(this.id, item.id);
                openDropdown(extraButton, {
                    "View History": () => {
                        openPopup("history", {history: itemHistory});
                    },
                    "Copy": () => {
                        navigator.clipboard.writeText(JSON.stringify(item, null, 2));
                    },
                    "Delete": () => {
                        confirm("Are you sure you want to delete this item?", "Delete Item", "Cancel", async (value) => {
                            if (!value) return;
                            startLoading({fullscreen: true, message: "Deleting..."});
                            try {
                                // await $.ajax({url: `${baseURL}/api/location/${this.id}/${item.id}`, method: "DELETE"});
                                await deleteRecord(item.id);
                                await this.loadView("", true);
                            } catch (e) {
                                console.error(e);
                                alert("An error occurred while trying to delete the item.");
                            }
                            stopLoading();
                        });
                    }
                }, {"View History": itemHistory !== undefined && itemHistory.length > 0});
            });
            try {
                if (this.options["allow-inventorying"]) {
                    tr.on("click", e => {
                        if (e.target.tagName === "BUTTON") return;
                        tbody.find(`tr:not(#${item.id})`).removeClass("selected");

                        if (tr.hasClass("selected")) {
                            tr.removeClass("selected");
                            $(document).trigger("item-selected", null);
                            localStorage.removeItem("selectedItem");
                            return;
                        }

                        tr.toggleClass("selected");
                        localStorage.setItem("selectedItem", JSON.stringify(item));
                        $(document).trigger("item-selected", item);
                    });
                }
            } catch (e) {
                console.error(e);
            }
            if (this.options["print-form"].enabled && printButton != null) {
                extra.append(printButton);
            }
            if (showExtraButton && auth.isLoggedIn && auth.getUserProfile().admin) {
                extra.append(extraButton);
            }
            tr.append(extra);
            tbody.append(tr);
        }
        this.list.empty();
        table.append(tbody);
        this.list.append(table);
        if (this.options["allow-inventorying"] && auth.isLoggedIn) {
            if (this.options.columns.filter(i => i.attributes.includes("quantity")).length === 0) {
                this.list.append(await buildInventoryingForm(this.options["allow-additions"], this.options.columns, this.options["add-if-missing"], this.options["voice-search"]));
            } else {
                this.list.append(await buildInventoryingFormWithQuantity(this.options["allow-additions"], this.options.columns, this.options["add-if-missing"], this.options["remove-if-zero"], this.options["voice-search"]));
            }

        }

        $(document).trigger("load");
    }

    buildColumns() {

        const table = $("<table class='fill col'></table>");
        try {
            if (this.options.columns === undefined) return table;
            const columns = this.options.columns.filter(c => c !== null && c !== undefined && c.visible);
            const thead = $("<thead>");

            for (const column of columns) {
                if (column === null || column === undefined) continue;
                const th = $("<th>").html(column.name);
                thead.append(th);
            }

            thead.append($("<th class='extra'>"));

            table.append(thead);
        } catch (e) {
            console.error("Error building columns");
            console.error(e);
        }
        return table;
    }


    speakResult() {
        window.speechSynthesis.cancel();
        const firstItem = this.items[0];
        console.log(firstItem, this.options.columns);
        if (firstItem === undefined) return;

        const descriptionColumn = this.options.columns.filter(c => c.attributes.includes("description"))[0];
        const primaryKeyColumn = this.options.columns.filter(c => c.attributes.includes("primary"))[0];
        const mardensPriceColumn = this.options.columns.filter(c => c.attributes.includes("mp"))[0];
        if (descriptionColumn === undefined || primaryKeyColumn === undefined || mardensPriceColumn === undefined) return;

        const description = firstItem[descriptionColumn.real_name];
        const primaryKey = firstItem[primaryKeyColumn.real_name];
        const mardensPrice = firstItem[mardensPriceColumn.real_name];

        if (description === undefined || primaryKey === undefined || mardensPrice === undefined) return;

        let speech = new SpeechSynthesisUtterance();
        speech.lang = "en";
        speech.text = `${primaryKey} - ${description} for $${mardensPrice}`;
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    }


    /**
     * Retrieves the header information for the specified location.
     *
     * @return {Promise<ListHeading>} - A promise that resolves to an object containing the header information.
     */
    async getListHeader() {
        if (this.id === null) {
            return {
                name: "",
                location: "",
                po: "",
                image: "",
                options: [],
                posted: ""
            };
        }
        const url = `${baseURL}/api/location/${this.id}/?headings=true`;
        return await $.ajax({url: url, method: "GET"});
    }

    /**
     * Export the items data to a CSV file and initiate the download of the file.
     *
     * @return {void}
     */
    async exportCSV() {
        startLoading({fullscreen: true, message: "Exporting..."});
        const csv = (await $.get({
            url: `${baseURL}/api/location/${this.id}/export`,
            headers: {"Accept": "text/csv"}
        })).toString();
        const headers = await this.getListHeader();
        const name = `${headers.name}-${headers.po}-${this.id}.csv`;
        download(name, csv);
        stopLoading();

    }

    async edit() {
        this.list.empty();
        this.list.append(await buildOptionsForm(this.id, async () => {
            window.location.reload();
        }));

        $(document).trigger("load");
    }

}

