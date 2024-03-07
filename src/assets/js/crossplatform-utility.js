const isDedicatedClient = window.__TAURI__;

/**
 * Print data to a printer
 * @param {PrintOptions} data
 */
function print(data) {
    const printWindow = window.open('', 'PRINT', 'height=400,width=600');
    const page = $(`<html lang="en"><head><title>${print}</title></head></html>`);

}


export {print, isDedicatedClient}