//NIGHTMARE BEFORE CHRISTMAS GRADE CHECKER

/* eslint-env node, browser*/
/* eslint no-console:0 */

var Nightmare = require('nightmare'),
    fs = require("fs");
var vo = require('vo')
var associations;
var orgUnits = ["64229", "10011"]; //Diddy's sandbox, JAM's sandbox
var authData = JSON.parse(fs.readFileSync("./auth.json"));
var selector = '#z_b'

//fix
vo(run)(function (err, result) {
    if (err) throw err
})


function * run() {
    var nightmare = Nightmare({
        show: true,
        typeInterval: 20,
        /*openDevTools: {
            mode: 'detach'
        },*/
        alwaysOnTop: false,
        waitTimeout: 20 * 60 * 1000
    });
    yield nightmare
        .goto('https://byui.brightspace.com/d2l/login?noredirect=1')
        .type("#userName", authData.username)
        .type("#password", authData.password)
        .click("a.vui-button-primary")
        .wait(function () {
            //go to d2l home
            console.log("Waiting");
            return document.location.href === "https://byui.brightspace.com/d2l/home";
        })
        .catch(function (error) {
            console.error(error);
        });

    for (var i = 0; i < orgUnits.length; i++) {
        var unit = orgUnits[i];
        yield nightmare
            .goto("https://byui.brightspace.com/d2l/lms/grades/admin/manage/gradeslist.d2l?ou=" + orgUnits[i])
            .wait(function (unit) {
                console.log("Waiting");
                return document.location.href === "https://byui.brightspace.com/d2l/lms/grades/admin/manage/gradeslist.d2l?ou=" + unit;
            }, unit)
            .wait('#z_b') //Wait for the grade-item table to load
            .evaluate(function (selector) {
                // now we're executing inside the browser scope.
                return document.querySelector(selector).innerText;
            }, selector) // <-- that's how you pass parameters from Node scope to browser scope
            .then(function (text) {
                console.log(text)
            })
    }
    yield nightmare.end()
}

