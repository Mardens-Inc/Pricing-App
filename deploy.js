build().then(file => upload(file)).then(success => {
    console.log(success ? "Upload successful" : "Upload failed")
});

async function build() {
    const path = require("path");
    console.log('Building the project...');
    const command = "cargo tauri build -b none";
    const {exec} = require('child_process');
    // run the command and wait for it to finish
    const process = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`BUILD >> ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`BUILD >> ${stderr}`);
        }
        if(stdout) {
            console.log(`BUILD >> ${stdout}`);
        }
    });

    // wait for the process to finish
    while (process.exitCode === undefined || process.exitCode === null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return path.join(__dirname, "src-tauri/target/release/pricing-app.exe");
}

function getVersionFromCargo() {
    console.log("getting version from Cargo.toml");
    const fs = require('fs');
    const path = require('path');
    const cargo = fs.readFileSync(path.join(__dirname, "src-tauri", "Cargo.toml")).toString();
    return cargo.match(/version = "(.*)"/)[1];
}

async function upload(file) {
    console.log('Uploading the file...');
    const fs = require('fs');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(file));
    form.append("version", getVersionFromCargo())
    const axios = require('axios').default;
    const httpsAgent = new (require('https').Agent)({rejectUnauthorized: false});

    const response = await axios.post("https://pricing-new.mardens.com/api/clients/upload", form, {httpsAgent});
    return response.status === 200;
}