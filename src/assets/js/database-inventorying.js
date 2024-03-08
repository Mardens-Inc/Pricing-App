import {alert} from "./popups.js";

async function buildInventoryingForm(allowAdditions, columns) {
    try {
        $("main > .list").addClass('row')
        $("main > .list").removeClass('col')

        const inventoryingForm = $(`<form id="inventorying-form" class="col fill" action="javascript:void(0);"></form>`);

        inventoryingForm.append(`<h1>Inventorying</h1>`);
        /**
         * @type {Column[]}
         */
        const primaryKeyColumn = columns.filter(column => column.attributes.includes('primary'));
        /**
         * @type {Column[]}
         */
        const quantityColumn = columns.filter(column => column.attributes.includes('quantity'));
        if (primaryKeyColumn.length === 0) {
            inventoryingForm.append(`<p>Primary key column not found</p>`);
        }
        if (quantityColumn.length === 0) {
            inventoryingForm.append(`<p>Quantity column not found</p>`);
        }
        if (primaryKeyColumn.length === 0 || quantityColumn.length === 0) {
            inventoryingForm.append(`<p>Missing required fields, add them in the <a href="javascript:void();" onclick="$('#edit-button').trigger('click')">"Database Settings"</a> section</p>`);
            return inventoryingForm;
        }

        const primaryKey = primaryKeyColumn[0].real_name;
        const quantityKey = quantityColumn[0].real_name;


        const primaryInput = $(`
            <div class="floating-input">
                <input type="text" id="primary-key" name="primary-key" required placeholder="" autocomplete="off">
                <label for="primary-key">${primaryKeyColumn[0].name} <i class="fa-solid fa-key"></i></label>
            </div>`)

        const quantityInput = $(`
            <div class="floating-input">
                <input type="number" id="quantity" name="quantity" required placeholder="" autocomplete="off" step="1">
                <label for="quantity">${quantityColumn[0].name}</label>
            </div>`)

        const submitButton = $(`<button type="submit" class="fill primary center horizontal vertical">Update</button>`);
        const addToggle = $(`<toggle id="add-item" value="false">Add?</toggle>`);
        const additionSection = $(`<section id="addition-section" class="col fill" toggle-hidden="add-item"></section>`);
        for (const column of columns) {
            if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
            const input = $(`
                <div class="floating-input">
                    <input type="text" id="${column.name}" name="${column.name}" placeholder="" autocomplete="off">
                    <label for="${column.name}">${column.name}</label>
                </div>`);
            additionSection.append(input);
        }

        inventoryingForm.append(primaryInput);
        inventoryingForm.append(quantityInput);
        if (allowAdditions) {
            inventoryingForm.append(addToggle);
            inventoryingForm.append(additionSection);
        }
        inventoryingForm.append(submitButton);

        addToggle.on("toggle", (e, data) => {
            const value = data.value;
            if (value) {
                if (addToggle.text() === "Add?")
                    submitButton.text("Add")
                const inputs = additionSection.find("input");
                for (const input of inputs) {
                    $(input).prop('required', true);
                }
                inputs.val('');

            } else {
                submitButton.text("Update")
                const inputs = additionSection.find("input");
                for (const input of inputs) {
                    $(input).prop('required', false);
                }
                inputs.val('');
            }
        });

        $(document).on("item-selected", (e, item) => {

            if (item === null || item === undefined) {
                window.localStorage.removeItem("selectedItem");
                primaryInput.find("input").val("");
                quantityInput.find("input").val("");
                if (allowAdditions) {
                    addToggle.text("Add?");
                    if (addToggle.attr('value') === "true") {
                        submitButton.text("Add")
                    }
                    for (const column of columns) {
                        if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
                        additionSection.find(`input[name="${column.name}"]`).val("");
                    }
                }

                return;
            }
            console.log(item)
            primaryInput.find("input").val(item[primaryKey]);
            quantityInput.find("input").val(item[quantityKey]);
            addToggle.text("Edit?");
            submitButton.text("Update")
            window.localStorage.setItem("selectedItem", item.id);


            if (allowAdditions) {
                for (const column of columns) {
                    if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
                    additionSection.find(`input[name="${column.name}"]`).val(item[column.name]);
                }
            }
        });

        inventoryingForm.append($(`<link rel="stylesheet" href="assets/css/inventory-form.css">`))

        inventoryingForm.on('submit', async (e) => {
            let selectedItem = window.localStorage.getItem("selectedItem");

            if (selectedItem === null || selectedItem === undefined) {
                if (primaryInput.find("input").val() === "" || quantityInput.find("input").val() === "") {
                    alert("Primary key and quantity are required");
                    return;
                } else {
                    const searchResults = (await $.ajax({
                        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/search`,
                        method: "POST",
                        data: JSON.stringify({"query": primaryInput.find("input").val(), "columns": [primaryKey], "limit": 1, "offset": 0, "asc": true, "sort": primaryKey}),
                        contentType: "application/json",
                        headers: {"Accept": "application/json"}
                    }))["items"];
                    if (searchResults.length > 0) {
                        selectedItem = searchResults[0];
                        console.log(selectedItem)
                        // fill in the rest of the form
                        for (const column of columns) {
                            if (column.attributes.includes('primary') ||
                                column.attributes.includes('quantity') ||
                                column.attributes.includes('readonly') ||
                                additionSection.find(`#${column.name}`).val() !== "") continue;

                            additionSection.find(`input[name="${column.name}"]`).val(searchResults[0][column.name]);
                        }
                    } else {
                        selectedItem = null;
                    }
                }
            } else {
                const url = `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/${selectedItem}`;
                try {
                    selectedItem = await $.ajax({url, method: "GET", headers: {"Accept": "application/json"}});
                } catch (e) {
                    console.error(e);
                    alert(`Unable to get selected item from the server, please contact IT/Support<br>${e.error ?? "No error message was provided!"}`, null, null);
                    addToggle.trigger("toggle", [{value: true}]);
                }
            }
            const quantityValue = processQuantityInput(quantityInput.find("input"), addToggle.attr("value") === "true" && selectedItem !== null, Number.parseInt(selectedItem[quantityKey]));

            if (selectedItem === null || selectedItem === undefined) {
                if (addToggle.attr('value') === "false") {
                    alert("Item not found, please add the item first", null, null);
                    addToggle.trigger("toggle", [{value: true}]);
                } else {
                    const data = {};
                    for (const column of columns) {
                        if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
                        data[column.name] = additionSection.find(`input[name="${column.name}"]`).val();
                    }
                    data[primaryKey] = primaryInput.find("input").val();
                    data[quantityKey] = quantityValue;
                    await add(data);
                }
            } else {
                const data = {};
                for (const column of columns) {
                    if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
                    data[column.name] = additionSection.find(`input[name="${column.name}"]`).val();
                }
                data[primaryKey] = primaryInput.find("input").val();
                data[quantityKey] = quantityValue;
                await update(selectedItem, data);
            }
        });


        return inventoryingForm;
    } catch (error) {
        console.error(error);
        return $("<p>Failed to load inventorying form</p>");
    }
}

/**
 * Processes the input for the quantity field.
 * @param {JQuery<HTMLInputElement<number>>} quantity - The input element for the quantity field.
 * @param {boolean} edit - Whether the form is in edit mode.
 * @param {number|null} originalQuantity - The original data for the item.
 * @returns {number}
 */
function processQuantityInput(quantity, edit, originalQuantity = null) {
    let value = 0;
    try {
        value = Number.parseInt(quantity.val().replace(/[^0-9-]/g, "")); // Parse the value of the input as an integer.
    } catch (e) {
        console.log(e);
        alert("Invalid quantity value, please enter a valid number", null, null);
        return 0;
    }
    if (edit || originalQuantity === null) return value; // If the form is in edit mode or the original quantity is null, return the value.
    return value + originalQuantity; // Otherwise, return the sum of the value and the original quantity.
}


/**
 * Adds the specified data to the object.
 *
 * @param {object} data - The data to be added.
 * @return {Promise<void>} - A Promise that resolves when the update is complete.
 */
async function add(data) {
    await update(null, data);
}

/**
 * Updates the location information by making an AJAX POST request to the server.
 *
 * @param {string|null} item - The ID of the item to be updated. Set to null if creating a new item.
 * @param {Object} data - The data to be updated or created.
 * @returns {Promise<void>} - A promise that resolves when the update is completed.
 */
async function update(item, data) {
    const url = `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}`;
    if (item !== null) data["id"] = item;
    console.log(data)
    // await $.ajax({url: url, method: "POST", data: JSON.stringify(data), contentType: "application/json", headers: {"Accept": "application/json"}});
}


export {buildInventoryingForm}