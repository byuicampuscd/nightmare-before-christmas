/* eslint-env node, browser*/
/* eslint no-console:0 */
/*global require */

var downloader = function (show, devTools) {
    console.log(show);
    this.show = show || false;
    this.devTools = devTools;
    this.cookieJar = [];
    this.bad = [];
}
var dl = downloader.prototype;
// async map fucntion

dl.setCookies = function (callback) {
    console.log("Setting Cookies...");
    var Nightmare = require('nightmare'),
        fs = require("fs"),
        nightmare,
        me,
        nightmarePrefs = {
            show: true,
            typeInterval: 20,
            alwaysOnTop: false,
            waitTimeout: 20 * 60 * 1000
        };
	require('nightmare-helpers')(Nightmare);
    nightmare = Nightmare(nightmarePrefs);
    var authData = JSON.parse(fs.readFileSync("./auth.json"));
    nightmare
        .goto('https://byui.brightspace.com/d2l/login?noredirect=1')
		.inject("javascript", "./jquery.js")
		.wait(1000)
		.evaluate(function () {
			$("body > *").css({visibility:"hidden", position:"absolute", "margin-left":"-10000px"});
			var username = $("<input>", {type:"text", placeholder:"username",id:"usernamethinggy"});
			var password = $("<input>", {type:"password", placeholder:"password", id:"passwordthinggy"});
			var done = $("<button>CLick ME</button>", {value:"submit", id:"done", "data-shddwnld":"not sure"});
			done.click("click", function(){
				console.log("Hello World!");
				$("#userName").val(username.val());
				$("#password").val(password.val());
				$(this).attr("data-shddwnld", "sure")
			});
			$("html").append(username);
			$("html").append(password);
			$("html").append(done);
		})
    .setWaitTimeout(5,0,0)
	.wait("button[data-shddwnld=\"sure\"]")
    .click("a.vui-button-primary")
	.wait(1000)
    .waitURL("https://byui.brightspace.com/d2l/home")
        .cookies.get()
        .end()
        .then(function (cookies) {
            this.cookieJar = cookies;
            console.log("Cookies Set...", this.cookieJar);
            console.log("done");
            callback();
        })
        .catch(function (error) {
            console.error(error);
        });


};

dl.downloadCourse = function (params, callback) {
    if(!this.cookieJar || this.cookieJar === []){   
        console.log("Hold on...where is your cookie?!")
        return;
    }
    console.log(typeof callback);
    var org = params.org;
    var path = params.path;
    var me = params.me;
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
            show: me.show,
            typeInterval: 20,
            alwaysOnTop: false,
            waitTimeout: 20 * 60 * 1000
        };
    require('nightmare-download-manager')(Nightmare);
    require('nightmare-helpers')(Nightmare);



    if (me.devTools) {
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

    //nightmare.setWaitTimeout(30*1000);
        function process() {
            return document.getElementsByTagName("h1")[0].innerHTML.match(/(Internal Error)/g).length > 0;
        }
    var shouldStop = false;
    console.log(this.cookieJar);
	var hangtime = 25*1000
    nightmare
        .downloadManager()
        .goto('https://byui.brightspace.com/d2l/login?noredirect=1')
        .cookies.set(this.cookieJar)
        //go to check box page 
        .setWaitTimeout(0,30,0)
        .goto("https://byui.brightspace.com/d2l/lms/importExport/export/export_select_components.d2l?ou=" + ou)
        .wait(hangtime)
        .wait(function(){
            return document.getElementsByTagName("h1")[0].innerHTML.match(/(Select Course Material)/g);
        })
        .wait('input[name="checkAll"]')
        .click('input[name="checkAll"]')
        .wait(hangtime)
        .wait('a.vui-button-primary')
        .click('a.vui-button-primary')
        //go to confirm page
        .wait(hangtime)
        .wait(function (ou) {
            return document.location.href === "https://byui.brightspace.com/d2l/lms/importExport/export/export_select_confirm.d2l?ou=" + ou;
        }, ou)
        .wait(hangtime)
        .wait('.vui-button-primary')
        .check('input[name="exportFiles"]')
        .click('.vui-button-primary')
        //go to zipping proccess page
        .wait(hangtime)
        .wait(function (ou) {
            return document.location.href === "https://byui.brightspace.com/d2l/lms/importExport/export/export_process.d2l?ou=" + ou;
        }, ou)
        .wait(hangtime)
        .setWaitTimeout(20,0,0)
        .wait(hangtime)
        .wait('.vui-button-primary[aria-disabled="false"]')
        .wait(hangtime)
        .click('a.vui-button-primary')
        .wait(hangtime)
        //go to export_summary
        .wait(function () {
            return document.location.origin + document.location.pathname === "https://byui.brightspace.com/d2l/lms/importExport/export/export_summary.d2l";
        }, ou)
        .wait(hangtime)
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
            me.bad.push(ou);
            callback(null, ou);
        });
}

module.exports = downloader;


//var ou = "16179";
//var ou = "112655";
//var ou = "10011";