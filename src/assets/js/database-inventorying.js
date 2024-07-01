import {startLoading, stopLoading} from "./loading.js";
import {addRecord, searchRecords, updateRecord} from "./location.js";
import {alert} from "./popups.js";

let primaryKeyDebounce = 0;

/**
 *
 * @type {{addIfMissing: boolean, columns: Column[], voiceSearch: boolean, allowAdditions: boolean}}
 */
let formOptions = {
    allowAdditions: true,
    columns: [],
    addIfMissing: true,
    voiceSearch: true
}

let primaryKeyColumn;

/**
 * The submit button for the form.
 * @type {JQuery<HTMLButtonElement>}
 */
const submitButton = $("<div>")
    .text("Add")
    .attr('id', 'submit-button')
    .addClass('button primary center horizontal vertical')
    .css({marginInline: 'auto', marginTop: '1em', minWidth: '100px', width: '33%', maxWidth: '500px'});

/**
 * Builds the inventorying form based on the provided parameters.
 * @param {boolean} allowAdditions - Flag indicating whether to allow additions to the inventory.
 * @param {Column[]} columns - Array of Column objects representing the columns in the database.
 * @param {boolean} addIfMissing - Flag indicating whether to add a new item if no matching item is found.
 * @param {boolean} voiceSearch - Flag indicating whether to enable voice search in the form.
 * @return {Promise.<JQuery<HTMLElement>>} - A promise resolving to the built inventorying form.
 */
async function buildInventoryingForm(allowAdditions, columns, addIfMissing, voiceSearch) {
    formOptions.allowAdditions = allowAdditions;
    formOptions.columns = columns;
    formOptions.addIfMissing = addIfMissing;
    formOptions.voiceSearch = voiceSearch;
    primaryKeyColumn = formOptions.columns.filter(column => column.attributes.includes('primary')).map(column => column.name)[0];


    $(document).on("item-selected", (e, item) => handleSelection(item));

    const form = createFormElements();

    form.append(submitButton);

    // events
    form.on('submit', (e) => {
        e.preventDefault();
    });
    submitButton.on('click', (e) => {
        const data = form.serializeArray();
        const item = {};
        for (let {name, value} of data) {
            item[name] = value;
        }
        submit(item);
    });

    form.find("input[attributes*='primary']").on('keyup', (e) => {
        clearTimeout(primaryKeyDebounce)
        primaryKeyDebounce = setTimeout(async () => {
            const input = $(e.target);
            const value = input.val();
            const item = await findSelectedItemFromPrimaryKey(value);

            if (value !== '' && item && item[primaryKeyColumn] === value) {
                submitButton.text("Update");
                localStorage.setItem("selectedItem", JSON.stringify(item));
            } else {
                submitButton.text("Add");
                localStorage.removeItem("selectedItem");
            }
            console.log(item)
        }, 500);
    });


    return form;

}


function createFormElements() {
    const form = $(`<form id='inventorying-form' class="col" action="javascript:void(0);"></form>`);
    form.append($(`<h1>Inventorying Form</h1>`));
    for (let column of formOptions.columns) {
        if (column.attributes.includes('readonly')) continue;
        const attributes = column.attributes.join(',');
        let id = column.name.replace(/\s/g, '-').toLowerCase();

        const input = $(`
        <div class="floating-input">
                <input type="${column.attributes.includes('price') || column.attributes.includes('mp') ? 'number" min="0" step="0.01' : 'text'}" id="${id}" name="${id}" placeholder="" autocomplete="off" attributes="${attributes}" realname="${column.real_name}">
                <label for="${id}">${column.name}${column.attributes.includes('primary') ? '<i class="fa-solid fa-key"></i>' : ''}</label>
            </div>
        `)

        // if (column.attributes.includes('required')) {
        //     input.find('input').attr('required', 'true');
        // }
        form.append(input);
    }
    form.append($(`<link rel="stylesheet" href="assets/css/inventory-form.css">`))

    return form;
}

function handleSelection(item) {
    if (item == null) {
        clearFormInputs();
        submitButton.text("Add");
        return;
    }
    for (let key in item) {
        const input = $(`input[realname="${key}"]`);
        if (input.length === 0) continue;
        input.val(item[key]);
    }
    submitButton.text("Update");
}

/**
 * The `submit` function is used to submit the form data and perform certain follow-up actions.
 * @param {Object} item - The item to be submitted.
 */
function submit(item) {
    const selectedItem = localStorage.getItem("selectedItem");
    if (selectedItem) {
        try {

            const selected = JSON.parse(selectedItem);
            for (let key in selected) {
                if (item[key] === undefined) {
                    item[key] = selected[key];
                }
            }
            const id = selected['id'];
            if (id !== undefined) {
                console.log(`Using selected item: ${id}`)
                update(id, item);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }
    // search for the item based on the id
    const value = item[primaryKeyColumn.toLowerCase()];
    if (value) {
        startLoading({fullscreen: true, message: "Searching..."})
        findSelectedItemFromPrimaryKey(value)
            .then((result) => {
                stopLoading();
                if (result) {
                    update(result['id'], item);
                } else {
                    add(item);
                }
            })
            .catch((err) => {
                stopLoading();
                console.error(err);
            });
    } else {
        alert("Missing primary key value.");
    }


    console.log(item);
    $(document).trigger("item-selected", null);
    stopLoading();
    clearFormInputs();
}

/**
 * Searches for an item in the database based on the provided value.
 * @param {string} value
 * @returns {Promise<Object|null>}
 */
async function findSelectedItemFromPrimaryKey(value) {
    try {
        const results = await searchRecords(value, [`${primaryKeyColumn}`], 1, 0, primaryKeyColumn, true);
        if (results == null || results.length === 0) return null;
        return results["items"][0];
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * The `update` function is used to update a record and perform certain
 * follow-up actions.
 *
 * @param {number|string} id - The identification unique to the record to be updated.
 * @param {object} item - The updated values for the record.
 *
 * The function does the following:
 *
 *   1.  Initiates full-screen loading with a provided message "Updating...",
 *   2.  Calls `updateRecord(id, item)` method to update the record,
 *   3.  Upon successful completion of the update:
 *       -  Stops the loading animation,
 *       -  Clears form inputs,
 *       -  Triggers a 'search' event on the document with `id` as parameter.
 *   4.  If an error occurs during the update:
 *       -  Stops the loading animation,
 *       -  Writes out the console error message.
 *
 * The whole operation is asynchronous (returns a promise).
 */
function update(id, item) {
    startLoading({fullscreen: true, message: "Updating..."})
    const real_item = mapItemToRealName(item);
    updateRecord(id, real_item)
        .then(() => {
            stopLoading();
            clearFormInputs();
            $(document).trigger("search", item[primaryKeyColumn.toLowerCase()]);
        })
        .catch((err) => {
            stopLoading();
            console.error(err);
        });
}

/**
 * The `add` function is used to add a new item and perform certain follow-up actions.
 *
 * @param {Object} item - The item to be added.
 *
 * The function does the following:
 *   1.  Initiates full-screen loading with a provided message "Adding...",
 *   2.  Calls `addRecord(item)` method to add the item,
 *   3.  Upon successful completion of the addition:
 *       - Stops the loading animation,
 *       - Clears form inputs,
 *       - Triggers a 'search' event on the document with the primary key of the added item as a parameter.
 *   4.  If an error occurs during the addition:
 *       - Stops the loading animation,
 *       - Writes out the console error message.
 *
 * The whole operation is asynchronous (returns a promise).
 */
function add(item) {

    startLoading({fullscreen: true, message: "Adding..."})

    const real_item = mapItemToRealName(item);
    addRecord([real_item])
        .then(() => {
            stopLoading();
            clearFormInputs();
            $(document).trigger("search", item[primaryKeyColumn.toLowerCase()]);
        })
        .catch((err) => {
            stopLoading();
            console.error(err);
        });
}

/**
 * The `mapItemToRealName` function is used to map the item to the real name.
 * @param {Object} item - The item to be mapped.
 * @returns {Object} - The mapped item.
 */
function mapItemToRealName(item) {
    const realItem = {};
    for (let key in item) {
        const column = formOptions.columns.filter(column => column.name.toLowerCase() === key.toLowerCase())[0];
        if (column) {
            realItem[column.real_name] = item[key];
        }
    }
    return realItem;
}

/**
 * The `clearFormInputs` function is used to clear all the inputs in the form.
 */
function clearFormInputs() {
    $("#inventorying-form input").val("");
}

export {buildInventoryingForm}