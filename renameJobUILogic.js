const electron = require('electron');
const events = require('./renameEvents.js');
const {ipcRenderer} = electron;

let eventsUI = {};
eventsUI[events.eventTypes.renamed] = {
    icon: 'insert_drive_file',
    badge: {
        caption: 'renamed',
        color: 'blue'
    }
}
eventsUI[events.eventTypes.skipped] = {
    icon: 'insert_drive_file',
    badge: {
        caption: 'skipped',
        color: 'grey'
    }
}
eventsUI[events.eventTypes.directory] = {
    icon: 'folder',
    badge: null
}
eventsUI[events.eventTypes.error] = {
    icon: 'insert_drive_file',
    badge: {
        caption: 'error',
        color: 'red'
    }
}

const ul = document.querySelector('ul');

ipcRenderer.on(events.eventTypes.renamed, function(e, item){
    addCollectionItem(events.eventTypes.renamed, item)
});

ipcRenderer.on(events.eventTypes.skipped, function(e, item){
    addCollectionItem(events.eventTypes.skipped, item)
});

ipcRenderer.on(events.eventTypes.directory, function(e, item){
    addCollectionItem(events.eventTypes.directory, item)
});

ipcRenderer.on(events.eventTypes.error, function(e, item){
    addCollectionItem(events.eventTypes.error, item)
});

ipcRenderer.on(events.eventTypes.done, function(e, item){
    document.getElementById("rename:status").innerText = "Renaming... Done!"
    const progressBar = document.getElementById("progress-bar")
    progressBar.className = "determinate"
    progressBar.style = "width: 100%"
});

function addCollectionItem(event, item) {
    let li = document.createElement('li');
    li.className = "collection-item";
    const collectionItem = createItem(event, item);
    li.appendChild(collectionItem);
    ul.appendChild(li);
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
    parent.appendChild(document.createTextNode(message));
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

