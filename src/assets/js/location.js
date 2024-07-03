import auth from "./authentication.js";
import {stopLoading, updateLoadingOptions} from "./loading.js";

/**
 * Adds a record to the specified location in the database.
 *
 * @param {Object[]} records - The records to be added.
 * @return {Promise<Object>} - A promise that resolves when the operation is complete.
 */
async function addRecord(records) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/`,
        method: "POST",
        data: JSON.stringify(records),
        contentType: "application/json",
        headers: {
            accept: "application/json",
            "X-User": auth.getUserProfile().username
        },
    });
}


/**
 * Adds multiple records to the specified location in the database.
 * @param {string} data
 * @returns {Promise<void>}
 */
async function batchAddRecords(data) {

    const count = data.length;
    let currentProcessed = 0;
    let size = 1_000;
    let ids = [];

    let itemsPerSecond = 0;
    let start = new Date().getTime();
    let countDown = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let allItemsPerSecond = [];
    let i = 0;
    let calculateETATimer = 0;

    const calculateETA = () => {
        // average the items per second
        const averageItemsPerSecond = allItemsPerSecond.reduce((a, b) => a + b, 0) / allItemsPerSecond.length;
        console.log(`Average items per second: ${averageItemsPerSecond}`)

        // calculate eta based on the items per second
        const eta = (count - i) / averageItemsPerSecond;

        // format time as 00hr 00m 00s
        hours = Math.floor(eta / 3600);
        minutes = Math.floor((eta % 3600) / 60);
        seconds = Math.floor(eta % 60);
    }

    calculateETATimer = setInterval(calculateETA, 10000)

    countDown = setInterval(() => {
        seconds--; // decrement the seconds
        if (seconds < 0) { // if seconds is less than 0
            seconds = 59; // set seconds to 59
            minutes--; // decrement minutes
            if (minutes < 0) { // if minutes is less than 0
                minutes = 59; // set minutes to 59
                hours--; // decrement hours
                if (hours < 0) { // if hours is less than 0
                    hours = 0; // set hours to 0
                    minutes = 0; // set minutes to 0
                    seconds = 0; // set seconds to 0
                }
            }
        }

        // format time as 00hr 00m 00s
        let etaFormatted = "";
        if (hours > 0)
            etaFormatted += `${hours}hr `;
        if (minutes > 0)
            etaFormatted += `${minutes}m `;
        etaFormatted += `${Math.ceil(seconds)}s`;

        // update the loading message
        updateLoadingOptions({
            message: `Importing data, Please wait!<br>Records ${currentProcessed} of ${count}<br>ETA: ${etaFormatted}`,
            fullscreen: true,
        })
    }, 1000)

    for (i = 0; i < count; i += size) {
        // get the records from filemaker
        let records = (data.slice(i, i + size))
            .map(record => {
                    const data = {...record}; // create a copy of the record

                    // if the records have an "id" field, rename it to "identifier" and if the records have a "date" field, rename it to "fm_date"
                    for (const key in data) {
                        if (key.toLowerCase() === "id") {
                            data["identifier"] = data[key];
                            record["identifier"] = record[key];
                            delete data[key];
                            delete record[key];
                        }
                        if (key.toLowerCase() === "date") {
                            data["fm_date"] = data[key];
                            record["fm_date"] = record[key];
                            delete data[key];
                            delete record[key];
                        }

                    }
                    return record;
                }
            )

        try {
            // upload the data to the server
            await addRecord(records);
        } catch (e) {
            console.log(e)
            // clearInterval(countDown); // clear the countdown interval

            // if an error occurs, update the loading message and return
            updateLoadingOptions({
                message: `An error has occurred while uploading data.<br>Please contact support.`,
                fullscreen: true,
            })

            continue;
        }
        // calculate items per second
        const time = new Date().getTime();
        itemsPerSecond = (size / ((time - start) / 1000));
        start = time;

        allItemsPerSecond.push(itemsPerSecond);

        // update the current processed records
        currentProcessed += records.length;

        if (i < 2) calculateETA();
    }


    clearInterval(countDown); // clear the countdown interval
    clearInterval(calculateETATimer); // clear the calculateETA interval

    stopLoading(); // stop the loading screen
}

/**
 * Retrieves records from the server.
 *
 * @returns {Promise<Object>} A Promise that resolves with the retrieved records.
 */
async function getRecords() {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/`,
        method: "GET",
        headers: {accept: "application/json"},
    });
}

/**
 * Deletes a record with the specified id from the database.
 *
 * @param {string} id - The id of the record to be deleted.
 * @return {Promise<Object>} - A promise that resolves when the record is successfully deleted.
 */
async function deleteRecord(id) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/${id}/`,
        method: "DELETE",
        headers: {
            accept: "application/json",
            "X-User": auth.getUserProfile().username
        },
    });
}

/**
 * Updates a record with the given id and records.
 *
 * @param {number} id - The id of the record to be updated.
 * @param {object} records - The updated records data.
 * @returns {Promise<Object>} - A promise that resolves when the record is successfully updated.
 */
async function updateRecord(id, records) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/${id}/`,
        method: "POST",
        data: JSON.stringify(records),
        contentType: "application/json",
        headers: {
            accept: "application/json",
            "X-User": auth.getUserProfile().username
        },
    });
}

/**
 * Searches for records in the specified database using the provided query.
 *
 * @param {string} query - The search query.
 * @param {string[]} [columns=[]] - The columns to search within. Defaults to an empty array.
 * @param {number} [limit=10] - The maximum number of records to return. Defaults to 10.
 * @param {number} [page=0] - The page number of the results. Defaults to 0.
 * @param {string} [sort="id"] - The field to sort the results by. Defaults to "id".
 * @param {boolean} [ascending=true] - Specifies whether the results should be sorted in ascending order. Defaults to true.
 *
 * @return {Promise<Object>} - A promise that resolves with the search results.
 */
async function searchRecords(query, columns = [], limit = 10, page = 0, sort = "id", ascending = true) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/search`,
        method: "POST",
        data: JSON.stringify({query, columns, limit, page, sort, asc: ascending}),
        headers: {accept: "application/json"},
    });
}

export {addRecord, getRecords, deleteRecord, updateRecord, searchRecords, batchAddRecords};