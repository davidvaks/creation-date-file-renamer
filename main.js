const electron = require('electron');
const renamer = require('./renamer.js');

const {app, BrowserWindow, Menu, dialog, ipcMain} = electron;

let mainWindow;
let rootDirectory;

function createWindow() {
    mainWindow = new BrowserWindow({});
    mainWindow.loadFile('mainWindow.html');
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
};

function chooseRootDirectory() {
    rootDirectory = dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }, (filePaths) => {
        if (filePaths != null) {
         rootDirectory = filePaths[0];
         mainWindow.webContents.send('directory:chosen', {directory: rootDirectory});
         //dialog.showMessageBox(mainWindow, {title: "Chosen Directory", message: rootDirectory});
        }
    });
}

exports.selectDirectory = chooseRootDirectory;

app.on('ready', createWindow);

ipcMain.on('directory:choose', chooseRootDirectory);
ipcMain.on('rename:start', (event, item) => renamer.renameFiles(item));

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