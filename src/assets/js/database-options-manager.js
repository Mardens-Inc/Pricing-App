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
 * @property {Object} print-form
 * @property {boolean} print-form.enabled
 * @property {string} print-form.print-label
 * @property {string} print-form.print-year
 * @property {string} print-form.print-price-column
 * @property {string} print-form.print-retail-price-column
 * @property {boolean} print-form.print-show-retail
 * @property {boolean} show-date
 * @property {Object} voice-form
 * @property {boolean} voice-form.enabled
 * @property {string} voice-form.voice-description-column
 * @property {string} voice-form.voice-price-column
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

/**
 * Builds the options form for a given id.
 *
 * @param {string} id - The id to retrieve the options for.
 * @return {Promise<JQuery>} - A Promise that resolves to the HTML form representing the options.
 */
async function buildOptionsForm(id) {
    const html = $(await $.ajax({url: "assets/html/database-options-form.html", method: "GET"}));
    currentOptions = await getCurrentOptions(id);
    await buildIconList(html);
    setDefaultOptionValues(html);
    html.each((_, element) => {
        if (element.tagName === "FORM") {
            element.addEventListener("submit", () => {
                save();
            });
        }
    })

    return html;
}

/**
 * @param {string} id
 * @returns {Promise<Object>}
 */
async function getCurrentOptions(id) {
    return $.get(`${baseURL}/api/location/${id}/?headings=true`);
}

/**
 * Navigates to the icon list and populates it with icons.
 *
 * @param {JQuery} html - The HTML element or DOM object where the icons will be appended.
 * @return {Promise} - A promise that resolves when the icons have been loaded and rendered.
 */
async function buildIconList(html) {
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

/**
 * Sets the default option values for the form.
 * @param {JQuery} html
 */
function setDefaultOptionValues(html) {
    html.find("input#database-name").val(currentOptions.name);
    html.find("input#database-location").val(currentOptions.location);
    html.find("input#database-po").val(currentOptions.po);
    html.find("toggle#show-date").attr("value", currentOptions.options["show-date"]);
    html.find("toggle#voice-search").attr("value", currentOptions.options["voice-search"]);
    html.find("toggle#print").attr("value", currentOptions.options["print"]);
}

async function save() {
    // build new options object
    const newOptions = {
        name: $("input#database-name").val(),
        location: $("input#database-location").val(),
        po: $("input#database-po").val(),
        image: $("input[name='icon']:checked").val(),
        options: {
            "show-date": $("toggle#show-date").attr("value") ?? false,
            "voice-search-form": {
                "enabled": $("toggle#voice-search").attr("value") ?? false,
                "voice-description-column": $("input#voice-description-column").val() ?? "",
                "voice-price-column": $("input#voice-price-column").val() ?? ""
            },
            "print-form": {
                "enabled": $("toggle#print").attr("value") ?? false,
                "print-label": $("input#print-label").val() ?? "",
                "print-year": $("input#print-year").val() ?? "",
                "print-price-column": $("input#print-price-column").val() ?? "",
                "print-retail-price-column": $("input#print-retail-price-column").val() ?? "",
                "print-show-retail": $("toggle#print-show-retail").attr("value") ?? false
            }
        }
    };

    console.log(JSON.stringify(newOptions));

}

export {buildOptionsForm}