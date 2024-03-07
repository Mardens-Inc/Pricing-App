/**
 * @typedef {Object} ListHeading
 * @property {string} name
 * @property {string} location
 * @property {string} po
 * @property {string} image
 * @property {ListOptions} options
 * @property {string} post_date
 * @property {string[]} columns
 */
/**
 * @typedef {Object} ListOptions
 * @property {bool} allow-inventorying
 * @property {bool} allow-additions
 * @property {PrintOptions} print-form
 * @property {VoiceSearchOptions} voice-form
 * @property {Object[]} columns
 * @property {string} columns.name
 * @property {boolean} columns.visible
 * @property {string[]} columns.attributes
 */

/**
 *
 * @typedef {Object} PrintOptions
 * @property {boolean} enabled
 * @property {string} label-name
 * @property {string} year
 * @property {string} price-column
 * @property {string} retail-price-column
 * @property {boolean} show-retail
 * @property {string} label-size
 */

/**
 * @typedef {Object} VoiceSearchOptions
 * @property {boolean} enabled
 * @property {string} voice-description-column
 * @property {string} voice-price-column
 */

/**
 * @typedef {Object} Icon
 * @property {string} name
 * @property {string} url
 * @property {string} file
 */
