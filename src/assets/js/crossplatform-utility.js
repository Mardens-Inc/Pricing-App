const isDedicatedClient = window.__TAURI__;

/**
 * Print data to a printer
 * @param {RecordPrintData} data
 */
function print(data) {
    console.log(data);
    const printWindow = window.open('', 'PRINT', 'height=400,width=600');

    let bodyHtml = "";
    if (data.department) {
        bodyHtml += `<p class="dpt">${data.department}</p>`;
    }
    bodyHtml += `<p class="label">${data.label}</p>`;
    if (data.retail) {
        bodyHtml += `<p class="rp">${data.retail}</p>`;
    }
    if (data.mp) {
        bodyHtml += `<p class="mp">${data.mp}</p>`;
    }
    bodyHtml += `<p class="year">${data.year}</p>`;

    const pageHtml = `<html lang="en">
                        <head>
                            <title>Print</title>
                            <link rel="stylesheet" href="assets/css/printer.css">
                        </head>
                        <body size="${data.size}">
                            ${bodyHtml}
                        </body>
                    </html>`;

    console.log(pageHtml);
    printWindow.document.write(pageHtml);
    printWindow.print();
    printWindow.close();
}


export {print, isDedicatedClient}