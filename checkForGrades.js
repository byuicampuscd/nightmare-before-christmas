//NIGHTMARE BEFORE CHRISTMAS GRADE CHECKER

/* eslint-env node, browser*/
/* eslint no-console:0 */

var Nightmare = require('nightmare'),
    fs = require("fs");
require('nightmare-download-manager')(Nightmare);
//require('nightmare-helpers')(Nightmare);
var async = require("async");

var associations;
var orgUnits = ["64229", "10011"]; //Diddy's sandbox, JAM's sandbox

var nightmare = Nightmare({
    show: true,
    typeInterval: 20,
    /*openDevTools: {
        mode: 'detach'
    },*/
    alwaysOnTop: false,
    waitTimeout: 20 * 60 * 1000
});

//Make sure to add your credentials!
var authData = JSON.parse(fs.readFileSync("./auth.json"));

nightmare
    .goto('https://byui.brightspace.com/d2l/login?noredirect=1')
    .type("#userName", authData.username)
    .type("#password", authData.password)
    .click("a.vui-button-primary")
    .wait(function () {
        //go to d2l home
        console.log("Waiting");
        return document.location.href === "https://byui.brightspace.com/d2l/home";
    })
    .then(function () {
        console.log("Checking these courses:", orgUnits);
        async.eachSeries(orgUnits, check, function (err) {
            console.log('done!');
        })
    })
    .catch(function (error) {
        console.error(error);
    });
var selector = '#z_b' //the grades table
function check(unit, callback) {
    nightmare
        .goto("https://byui.brightspace.com/d2l/lms/grades/admin/manage/gradeslist.d2l?ou=" + unit)
        .wait(function (unit) {
            console.log("Waiting");
            return document.location.href === "https://byui.brightspace.com/d2l/lms/grades/admin/manage/gradeslist.d2l?ou=" + unit;
        }, unit)
        .wait('#z_b') //Wait for the grade-item table to load
        .evaluate(function (selector) {
            // now we're executing inside the browser scope.
            return document.querySelector(selector).innerText;
        }, selector) // <-- that's how you pass parameters from Node scope to browser scope
        .end()
        .then(function (text) {
            console.log(text)
            callback(text)
        })

}
