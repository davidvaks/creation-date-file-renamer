const electron = require('electron');
const {dialog} = electron;
const fs = require('fs');
const path = require('path');
const events = require('./renameEvents.js');

let allowedExtentions = new Set();
let allExtentions = false;
let jobWindow;
let loggingEnabled = true;
let rootDir;

exports.renameFiles = (item, window) => {
    if (isValidRootDirectory(item.root)) {
        jobWindow = window;
        rootDir = item.root;
        loggingEnabled = item.loggingEnabled
        allowedExtentions = getAllowedExtentions(item.extentions);
        let queue = [item.root];
        while (queue.length > 0) {
            const currentDir = queue.shift();
            report(currentDir, events.eventTypes.directory);
            fs.readdirSync(currentDir).forEach(file => {
                try {
                    const stats = fs.statSync(currentDir + '/' + file);
                    if (stats.isDirectory()) {
                        if (item.includeSubDirectories) queue.push(currentDir + '/' + file);
                    } else {
                        handleFile(currentDir, file, stats);
                    }
                } catch(err) {
                    report(err.message, events.eventTypes.error)
                }
              });
        }
        jobWindow.webContents.send(events.eventTypes.done);
    }
}

function getAllowedExtentions(extentionString) {
    if (extentionString == '*') {
        allExtentions = true
        return new Set();
    } else {
        allExtentions = false;
        const extentions = extentionString
            .split(",")
            .map(ext => '.' + ext.trim())
        return new Set(extentions);
    }

}

function handleFile(currentDir, file, stats) {
    const extention = path.extname(file).toLowerCase();
    if (allowedExtentions.has(extention) || allExtentions) {
        const creationTime = resolveCreationTime(stats);
        const formattedCreationTime = formatTime(creationTime);
        if (!alreadyRenamed(file, formattedCreationTime)) {
            const newFileName = resolveNewFileName(currentDir, formattedCreationTime, extention)
            renameFile(currentDir, file, newFileName);

            report('   ' + file + ' -> ' + newFileName, events.eventTypes.renamed, currentDir + '/' + newFileName);
        } else {
            report('   ' + file + ' skipped (already renamed)', events.eventTypes.skipped, currentDir + '/' + file)
        }
    } else {
        report('   ' + file + ' skipped', events.eventTypes.skipped);
    }
}

function renameFile(currentDir, oldFilename, newFilename) {
    try {
        if (fs.existsSync(currentDir + '/' + newFilename)) {
            report('        ' + oldFilename + ' skipped - ' + newFilename + ' already exist', events.eventTypes.skipped)
        } else {
            fs.renameSync(currentDir + '/' + oldFilename, currentDir + '/' + newFilename)
        }
    } catch(err) {
        report(err, events.eventTypes.error)
    }
}

function resolveNewFileName(currentDir, formattedCreationTime, extention) {
    let newFileName = formattedCreationTime + extention;
    let counter = 1;
    while (fs.existsSync(currentDir + '/' + newFileName)) {
        newFileName = formattedCreationTime + '-' + counter + extention;
        counter++;
    }
    return newFileName
}

function alreadyRenamed(file, formattedCreationTime) {
    return file.includes(formattedCreationTime)
}

function resolveCreationTime(fileStats) {
    const dates = [fileStats.atime, fileStats.mtime, fileStats.ctime, fileStats.birthtime];
    const ordered = dates.sort((a,b) => {
        return Date.parse(a) > Date.parse(b);
    });
    return ordered[0];
}

function formatTime(time) {
    return new Date(time)
                    .toISOString()
                    .replace("T", "_")
                    .replace("Z", "")
                    .replace(/:/g, "-")
                    .replace(".000", "")
                    .replace(".", "-");
}

function isValidRootDirectory(root) {
    const exists = fs.existsSync(root)
    if (!exists) {
        dialog.showErrorBox('Directory does not exist', root)
    }
    return exists;
}

function report(message, eventType, filePath) {
    console.log(message);
    writeToJobWindow(message, eventType, filePath);
}

function writeToJobWindow(message, eventType, filePath) {
    jobWindow.webContents.send(eventType, message, filePath);
}