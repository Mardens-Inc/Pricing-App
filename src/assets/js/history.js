import auth from "./authentication.js";
import {alert} from "./popups.js";

const ActionType = {
    CREATE: 0,
    UPDATE: 1,
    DELETE: 2,
}


/**
 * @typedef {Object} RecordOptions
 * @property {number} limit - The number of records to return
 * @property {number} page - The page number to return
 * @property {string} sort - The field to sort by
 * @property {boolean} asc - Whether to sort in ascending order
 */

/**
 * Retrieves the history of records from the server.
 *
 * @param {string} [location_id=""] - The id of the location to retrieve history from.
 * @param {string} [record_id=""] - The id of the specific record to retrieve history for.
 * @param {RecordOptions} [record_options={}] - Additional options to filter or sort the history.
 *
 * @return {Promise} - A promise that resolves with the history records retrieved from the server.
 * If there is an error, the promise is rejected with an error message.
 */
async function getHistory(location_id = "", record_id = "", record_options = {}) {
    const url = new URL(`${baseURL}/api/history`)
    if (location_id) {
        url.href += `/${location_id}`
        if (record_id) url.href += `/${record_id}`
    }
    if (record_options.limit) url.searchParams.append("limit", record_options.limit.toString())
    if (record_options.page) url.searchParams.append("page", record_options.page.toString())
    if (record_options.sort) url.searchParams.append("sort", record_options.sort)
    if (record_options.asc) url.searchParams.append("asc", record_options.asc.toString())
    try {
        return await $.get(url.href);
    } catch (e) {
        console.error(e)
        alert(`Unable to get history from the server!`);
    }
}

async function addHistory(location_id, record_id, action, data) {
    const url = `${baseURL}/api/history/`
    try {
        return await $.post({
            url: url,
            data: {
                location_id: location_id,
                record_id: record_id,
                action: action,
                user: auth.isLoggedIn?auth.getUserProfile().username:"NoAuthUser",
                data: data
            }

        });
    } catch (e) {
        console.error(e)
        alert(`Unable to add history to the server!`);
    }
}


export {getHistory, ActionType}