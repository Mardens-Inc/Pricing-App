import {startLoading, stopLoading} from "./loading.js";
import {alert} from "./popups.js";

$(document).on("loadPopup", async (element, data) =>
{
    const columnMappingElement = $("#column-mapping");
    columnMappingElement.empty();
    console.log(data);
    data = data.data;
    const columnsToBeMapped = data.columns.filter(column => column !== "id" && column !== "date" && column !== "history" && column !== "last_modified_date");
    const currentColumns = data.options.columns.filter(column => column !== "id" && column !== "date" && column !== "history" && column !== "last_modified_date");
    // const csv = data.csv;
    let columnMappings = {};
    console.log(columnsToBeMapped, currentColumns);
    for (let i = 0; i < currentColumns.length; i++)
    {
        const column = currentColumns[i];
        const columnElement = $(`<div class="row fill center vertical column-item"></div>`);
        columnElement.append(`<span class="fill">${column}</span>`);
        const button = $(`<button><i class="fa fa-chevron-down"></i></button>`);
        columnElement.append(button);
        columnMappings[column] = null;
        columnElement.attr("selectedColumn", null);
        columnElement.attr("column", column);

        button.on("click", () =>
        {
            let buttonMapping = {};
            for (let j = 0; j < columnsToBeMapped.length; j++)
            {
                const c = columnsToBeMapped[j];
                buttonMapping[c] = () =>
                {
                    if (columnElement.attr("selectedColumn") === c)
                    {
                        // Deselect Item
                        button.html(`<i class="fa fa-chevron-down"></i>`);
                        columnElement.attr("selectedColumn", null);
                        columnMappings[column] = null;
                    } else
                    {
                        // Select Item
                        button.html(`<span class="fill" style="margin-right: 1rem">${c}</span><i class="fa fa-chevron-down"></i>`);
                        columnElement.attr("selectedColumn", `${c}`);
                        columnMappings[column] = c;
                    }
                };
            }
            openDropdown(button, buttonMapping);
        });
        columnMappingElement.append(columnElement);
    }

    $("#save-column-mappings").on("click", async () =>
    {
        // Create new csv with new columns
        // let newCsv = "";
        // map csv to json
        let json = [];
        const original_columns = Object.keys(columnMappings).filter(i => columnMappings[i] !== null);
        const mapped_columns = Object.values(columnMappings).filter(i => i !== null);
        startLoading({message: "Mapping Columns", fullscreen: true});


        try
        {
            json = await window.__TAURI__.core.invoke("map_columns", {
                originalColumns: original_columns,
                newColumns: mapped_columns,
                items: data.json
            });
            stopLoading();
        } catch (e)
        {
            stopLoading();
            alert(`An error occurred while mapping the columns. Please try again later.<br><br>Error: ${e}`);
        }
        stopLoading();

        console.log(json);
        window.mappedData = json;
        $(document).trigger("loadedCSV", json);
    });
});