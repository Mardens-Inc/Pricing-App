const {app, BrowserWindow, globalShortcut} = require('electron');
const createWindow = async () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.setSize(1280, 720, true);
    win.setMenu(null);
    win.setMinimumSize(1280, 720);
    win.setIcon('frontend/assets/images/icon.ico');

    await win.loadFile('frontend/index.html');
    return win;
}

app.whenReady()
    .then(async () => {
        const win = await createWindow();
        app.on('activate', async () => {
            // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open
            if (BrowserWindow.getAllWindows().length === 0) {
                await createWindow();
            }
        });
        globalShortcut.register('CommandOrControl+Shift+I', () => {
            let win = BrowserWindow.getFocusedWindow(); // We're getting the currently focused Window
            if(win) {
                win.webContents.toggleDevTools(); // If there's a window, we'll toggle its DevTools
            }
        })

    });

// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});