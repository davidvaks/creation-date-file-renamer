const electron = require('electron');
const renamer = require('./renamer.js');

const {app, BrowserWindow, Menu, dialog, ipcMain} = electron;

let mainWindow;
let renameJobWindow;
let rootDirectory;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 650
    });
    mainWindow.loadFile('mainWindow.html');
    mainWindow.on('closed', () => {
        app.quit();
    });
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
};

function createRenameJobWindow(item) {
    renameJobWindow = new BrowserWindow({
        width: 600,
        height: 500,
        title: 'Rename Job'
    });
    renameJobWindow.loadFile('renameJobWindow.html');
    renameJobWindow.on('close', () => {
        renameJobWindow = null;
    });
    renameJobWindow.webContents.on('did-finish-load', () => {
        renamer.renameFiles(item, renameJobWindow);
    });
}

function chooseRootDirectory() {
    rootDirectory = dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }, (filePaths) => {
        if (filePaths != null) {
         rootDirectory = filePaths[0];
         mainWindow.webContents.send('directory:chosen', {directory: rootDirectory});
        }
    });
}

exports.selectDirectory = chooseRootDirectory;

app.on('ready', createMainWindow);

ipcMain.on('directory:choose', chooseRootDirectory);
ipcMain.on('rename:start', (event, item) => createRenameJobWindow(item));

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Choose Root Directory',
                click(){
                    chooseRootDirectory()
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if (process.platform == 'darwin') mainMenuTemplate.unshift({});

// dev tools menu
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}