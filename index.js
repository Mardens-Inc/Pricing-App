const {app, BrowserWindow} = require('electron');

const createWindow = async () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    await win.loadFile('frontend/index.html');
}

app.whenReady()
    .then(async () => {
        await createWindow();
        app.on('activate', async () => {
            // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open
            if (BrowserWindow.getAllWindows().length === 0) {
                await createWindow();
            }
        });
    });

// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});