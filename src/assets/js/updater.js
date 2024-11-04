import {isDedicatedClient} from "./crossplatform-utility.js";
import {alert} from "./popups.js";

window.canUpdate = false;

if (isDedicatedClient) {
    getCurrentVersion().then(version => {
        window.version = version;
    })
} else {
    window.version = "web-client";
}

/**
 * Checks for updates.
 *
 * @returns {Promise<boolean>} A Promise that resolves to a boolean if an update is available or not.
 */
async function checkForUpdates() {
    if (isDedicatedClient) {
        const result = await window.__TAURI__.core.invoke('download_update');
        console.log(`Checked for update: ${result ? "Update available" : "No update available"}`);
        return result;
    }
}

/**
 * Retrieves the current version from the Tauri application.
 *
 * @returns {Promise<string>} A Promise that resolves to the current version.
 */
async function getCurrentVersion() {
    if (isDedicatedClient)
        return await window.__TAURI__.core.invoke('get_current_version');
}

if (isDedicatedClient) {
    let update = setInterval(async () => await check(), 1000 * 60 * 1); // Check every 15 minutes
    const check = (async () => {
        if (await checkForUpdates()) {
            $(window).trigger("updateAvailable")
            window.canUpdate = true;
            clearInterval(update);
            alert("An update is available. Please restart the application to apply the update.", () => {
                window.__TAURI__.core.invoke('install_update');
            })
        }
    });

    check().then();

}

window.checkForUpdates = checkForUpdates;

export {checkForUpdates, getCurrentVersion}