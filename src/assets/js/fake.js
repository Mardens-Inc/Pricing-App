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
 * @property {MardensPriceOption[]} mardens-price
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
 * @property {number} year
 * @property {string} department
 * @property {string} route
 * @property {boolean} show-retail
 * @property {boolean} show-mp
 * @property {boolean} show-price-label
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


/**
 * @typedef {Object} PriceTaggerOptions
 * @property {PriceTaggerOption[]} routes
 */

/**
 * @typedef {Object} PriceTaggerOption
 * @property {string} name
 * @property {string} description
 * @property {Object} params
 * @property {string} params.department
 * @property {string} params.label
 * @property {number} params.year
 * @property {number} params.price
 * @property {number} params.percent
 * @property {number} params.mp
 *
 */

/**
 * @typedef {Object} MardensPriceOption
 * @property {string} column - The column name or 'All' for all columns
 * @property {number} percent - Whole number percentage (ie 50% = 50)
 */