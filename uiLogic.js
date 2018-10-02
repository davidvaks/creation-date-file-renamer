const electron = require('electron');
const {ipcRenderer} = electron;
document.getElementById('allowedExtentions').value = 'png, gif, jpg, jpeg, bmp, mov, avi, aae, mpg'
document.getElementById('all').addEventListener('click', () => {
    document.getElementById('allowedExtentions').disabled = true;
});
document.getElementById('specific').addEventListener('click', () => {
    document.getElementById('allowedExtentions').disabled = false;
});
document.getElementById('chooseDir').addEventListener('click', chooseDirectory);
document.getElementById('clearDir').addEventListener('click', () => {
    document.getElementById('rootText').value = '';
});
document.getElementById('startRenaming').addEventListener('click', submit)

function chooseDirectory(e) {
    e.preventDefault();
    ipcRenderer.send('directory:choose', {});
}

function submit(e) {
    e.preventDefault();
    const rootDirectory = document.getElementById('rootText').value
    const chosenExtentions = document.getElementById('specific').checked ? document.getElementById('allowedExtentions').value : '*';
    if (rootDirectory != null && rootDirectory != '' && chosenExtentions != '') {
        ipcRenderer.send('rename:start', {
            root: rootDirectory,
            extentions: chosenExtentions,
            includeSubDirectories: document.getElementById('include:subdirs').checked
        });
    }
}

ipcRenderer.on('directory:chosen', function(event, item){
    document.getElementById('rootText').value = item.directory;
});