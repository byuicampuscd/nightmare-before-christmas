/* eslint-env node, browser*/
/* eslint no-console:0 */
/*global require */

var downloader = function (show, devTools) {
    console.log(show);
    this.show = show || false;
    this.devTools = devTools;
}
var dl = downloader.prototype;
// async map fucntion
dl.downloadCourse = function (params, callback) {
    var org = params.org;
    var path = params.path;
    if (!org || !path) {
        console.log("Err: Please provide", (org) ? "a path for the download" : "an org unit");
        return;
    }
    console.log("Starting Download")
    var Nightmare = require('nightmare'),
        fs = require("fs"),
        ou = org,
        nightmare,
        nightmarePrefs = {
            show: this.show,
            typeInterval: 20,
            alwaysOnTop: false,
            waitTimeout: 20 * 60 * 1000
        };
    console.log(this.show);

    require('nightmare-download-manager')(Nightmare);



    if (this.devTools) {
        nightmarePrefs.openDevTools = {
            mode: 'detach'
        };
    }

    nightmare = Nightmare(nightmarePrefs);

    nightmare.on('download', function (state, downloadItem) {
        if (state === 'started') {
            nightmare.emit('download', path + `/d2lExport_${ou}_package.zip`, downloadItem);
        }
        if (state == "updated") {
            console.log("Downloaded: ", downloadItem.receivedBytes + " / " + downloadItem.totalBytes + " Bytes");
        }
    });

    function handleDownload(state, download) {
        console.log("Download: ")
        console.log("state:", state, download);
    }

    //until the user interface works, we will use this for now.
    var authData = JSON.parse(fs.readFileSync("./auth.json"));


    nightmare
        .downloadManager()
        .goto('https://byui.brightspace.com/d2l/login?noredirect=1')
        .type("#userName", authData.username)
        .type("#password", authData.password)
        .click("a.vui-button-primary")
        .wait(function () {
            //go to d2l home
            console.log("Waiting");
            return document.location.href === "https://byui.brightspace.com/d2l/home";
        })
        //go to check box page 
        .goto("https://byui.brightspace.com/d2l/lms/importExport/export/export_select_components.d2l?ou=" + ou)
        .wait('input[name="checkAll"]')
        .click('input[name="checkAll"]')
        .wait('a.vui-button-primary')
        .click('a.vui-button-primary')
        //go to confirm page
        .wait(function (ou) {
            return document.location.href === "https://byui.brightspace.com/d2l/lms/importExport/export/export_select_confirm.d2l?ou=" + ou;
        }, ou)
        .wait('.vui-button-primary')
        .check('input[name="exportFiles"]')
        .click('.vui-button-primary')
        //go to zipping proccess page
        .wait(function (ou) {
            return document.location.href === "https://byui.brightspace.com/d2l/lms/importExport/export/export_process.d2l?ou=" + ou;
        }, ou)
        .wait('.vui-button-primary[aria-disabled="false"]')
        .click('a.vui-button-primary')
        //go to export_summary
        .wait(function () {
            return document.location.origin + document.location.pathname === "https://byui.brightspace.com/d2l/lms/importExport/export/export_summary.d2l";
        }, ou)
        .wait('form a.vui-link')
        .click('form a.vui-link')
        .waitDownloadsComplete()
        .end()
        .then(function () {
            console.log("done");
            callback(null, ou);
        })
        .catch(function (error) {
            console.error(error);
        });
}

module.exports = downloader;


//var ou = "16179";
//var ou = "112655";
//var ou = "10011";