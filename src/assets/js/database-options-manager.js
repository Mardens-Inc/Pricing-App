/**
 * @typedef {Object} ListHeading
 * @property {string} name
 * @property {string} location
 * @property {string} po
 * @property {string} image
 * @property {ListOptions} options
 * @property {string} post_date
 */
/**
 * @typedef {Object} ListOptions
 * @property {boolean} print
 * @property {Object} print-form
 * @property {string} print-form.print-label
 * @property {string} print-form.print-year
 * @property {string} print-form.print-price-column
 * @property {string} print-form.print-retail-price-column
 * @property {boolean} print-form.print-show-retail
 * @property {boolean} show-date
 * @property {boolean} voice-search
 * @property {Object} voice-form
 * @property {string} voice-form.voice-description-column
 * @property {string} voice-form.voice-price-column
 * @property {string} voice-form.voice-retail-price-column
 * @property {boolean} voice-form.voice-show-retail
 * @property {boolean} voice-form.voice-show-date
 * @property {boolean} voice-form.voice-show-location
 * @property {boolean} voice-form.voice-show-po
 */

/**
 * @typedef {Object} Icon
 * @property {string} name
 * @property {string} url
 * @property {string} file
 */


/**+
 * @type {ListHeading}
 */
let currentOptions = {};

async function buildOptionsForm(id) {
    const html = $(await $.ajax({url: "assets/html/database-options-form.html", method: "GET"}));
    currentOptions = await getCurrentOptions(id);
    await navigateToIconList(html);
    return html;
}

/**
 * @param {string} id
 * @returns {Promise<Object>}
 */
async function getCurrentOptions(id) {
    return $.get(`${baseURL}/api/location/${id}/?headings=true`);
}

async function navigateToIconList(html) {
    /**
     * @type {Icon[]}
     */
    const icons = await $.get(`${baseURL}/api/locations/images`);
    const selectedIcon = icons.find(icon => icon.url === currentOptions.image);
    for (const icon of icons) {
        const name = icon.name.replace(/[^a-zA-Z]/g, "-");
        const iconHTML = $(`
                        <input type="radio" class="icon-item" id="${name}" name="icon" value="${icon.name}">
                        <label for="${name}" class="col">
                        <img src="${icon.url}" alt="${icon.name}">
                        <p>${icon.name}</p>
                        </label>`);
        if (selectedIcon && selectedIcon.name === icon.name) {
            iconHTML.attr("checked", "checked");
        }
        html.find("#icons.list").append(iconHTML);
    }
    // move selected icon to the front, if one exists
    if (selectedIcon) {
        html.find("#icons.list").prepend(html.find(`input[value="${selectedIcon.name}"]`).parent());
        html.find("#icons.list").prepend(html.find(`label[for="${selectedIcon.name}"]`).parent());
    }


}

export {buildOptionsForm}