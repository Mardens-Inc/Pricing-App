const fs = require('fs');

function checkForUpdates() {
    if (process.env.NODE_ENV === 'development') {
        return;
    }

    // Check for updates
    const currentVersion = getCurrentVersion();
    const latestVersion = getLatestVersion();


}

function getLatestVersion() {
    const url = 'https://api.github.com/repos/Mardens-Inc/pricing-app/releases/latest';
}
function getCurrentVersion() {
    if(process.env.NODE_ENV === 'development') {
        return 'dev';
    }
    if(!fs.existsSync('package.json')) {
        return '0.0.0';
    }

    const file = fs.readFileSync('package.json', 'utf8');
    const json = JSON.parse(file);
    return json.version;
}