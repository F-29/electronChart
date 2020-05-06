const electron = require('electron');
const path = require('path');
const globalShortcut = electron.globalShortcut;

if (require('electron-squirrel-startup')) {
    electron.app.quit();
}

const createWindow = () => {
    const mainWindow = new electron.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    globalShortcut.register('CommandOrControl+R', () => {
        mainWindow.reload();
    })
    mainWindow.setMenu(null);
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

};

electron.app.on('ready', createWindow);

electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});

electron.app.on('activate', () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

