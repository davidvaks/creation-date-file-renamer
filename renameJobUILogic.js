const electron = require('electron');
const events = require('./renameEvents.js');
const {ipcRenderer, shell} = electron;

let eventsUI = {};
eventsUI[events.eventTypes.renamed] = {
    icon: 'insert_drive_file',
    class: 'collection-item',
    badge: {
        caption: 'renamed',
        color: 'blue'
    }
}
eventsUI[events.eventTypes.skipped] = {
    icon: 'insert_drive_file',
    class: 'collection-item',
    badge: {
        caption: 'skipped',
        color: 'grey'
    }
}
eventsUI[events.eventTypes.directory] = {
    icon: 'folder',
    class: 'collection-header',
    badge: null
}
eventsUI[events.eventTypes.error] = {
    icon: 'insert_drive_file',
    class: 'collection-item',
    badge: {
        caption: 'error',
        color: 'red'
    }
}

const ul = document.getElementById('collection-parent');

ipcRenderer.on(events.eventTypes.renamed, (e, item, path) => {
    addCollectionItem(events.eventTypes.renamed, item, path)
});

ipcRenderer.on(events.eventTypes.skipped, (e, item, path) => {
    addCollectionItem(events.eventTypes.skipped, item, path)
});

ipcRenderer.on(events.eventTypes.directory, (e, item) => {
    addCollectionItem(events.eventTypes.directory, item)
});

ipcRenderer.on(events.eventTypes.error, (e, item, path) => {
    addCollectionItem(events.eventTypes.error, item, path)
});

ipcRenderer.on(events.eventTypes.done, (e, item) => {
    document.getElementById("rename:status").innerText = "Renaming... Done!"
    const progressBar = document.getElementById("progress-bar")
    progressBar.className = "determinate"
    progressBar.style = "width: 100%"
});

function addCollectionItem(event, item, path) {
    let a = document.createElement('a');
    a.href = '#';
    if (path != null) {
        a.addEventListener('click', () => openFile(path))
    }
    a.className = eventsUI[event].class;
    const collectionItem = createItem(event, item);
    a.appendChild(collectionItem);
    ul.appendChild(a);
}

function createItem(event, message) {
    const parent = document.createElement("div");
    const iconCaption = eventsUI[event].icon
    const badge = eventsUI[event].badge
    if (iconCaption != null) {
        const icon = document.createElement("i");
        icon.className = "material-icons";
        icon.appendChild(document.createTextNode(iconCaption));
        parent.appendChild(icon);
    }
    const font = document.createElement('font');
    font.color = '#000000';
    font.appendChild(document.createTextNode(message));
    parent.appendChild(font);
    if (badge != null) {
        parent.appendChild(createBadge(badge.caption, badge.color));
    }
    return parent;
}

function createBadge(caption, color) {
    const span = document.createElement("span");
    span.className = "new badge " + color;
    span.dataset.badgeCaption=caption;
    return span;
}

function openFile(path) {
    shell.openItem(path);
}

