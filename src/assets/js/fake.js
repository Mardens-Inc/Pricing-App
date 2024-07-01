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
 * @property {boolean} allow-inventorying
 * @property {boolean} allow-additions
 * @property {boolean} add-if-missing
 * @property {boolean} remove-if-zero
 * @property {PrintOptions} print-form
 * @property {boolean} voice-search
 * @property {string} mardens-price
 * @property {Column[]} columns
 */

/**
 * @typedef {Object} Column
 * @property {string} name
 * @property {string} real_name
 * @property {boolean} visible
 * @property {string[]} attributes
 */

/**
 *
 * @typedef {Object} PrintOptions
 * @property {boolean} enabled
 * @property {string} label
 * @property {string} year
 * @property {string} size
 * @property {boolean} show-retail
 */


/**
 * @typedef {Object} Icon
 * @property {string} name
 * @property {string} url
 * @property {string} file
 */

/**
 * @typedef {Object} RecordPrintData
 * @property {string} label
 * @property {string} year
 * @property {string} size
 * @property {string?} retail
 * @property {string?} mp
 * @property {string?} department
 *
 *
 */
