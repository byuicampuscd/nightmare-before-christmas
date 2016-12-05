//NIGHTMARE BEFORE CHRISTMAS GRADE CHECKER

/* eslint-env node, browser*/
/* eslint no-console:0 */

var Nightmare = require('nightmare'),
    fs = require("fs");
require('nightmare-download-manager')(Nightmare);
var async = require("async");

var orgUnits  = ["64229", "10011"]; //Diddy's sandbox, JAM's sandbox

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
        console.log("Ready to start checking courses.");
    })
    .catch(function (error) {
        console.error(error);
    });

function check(unit, callback){
  nightmare
  .goto("https://byui.brightspace.com/d2l/lms/grades/admin/manage/gradeslist.d2l?ou=" + unit)
  .wait(function(){
      console.log("Waiting");
        return document.location.href === "https://byui.brightspace.com/d2l/lms/grades/admin/manage/gradeslist.d2l?ou=" + unit;
  })
  //CHECK FOR GRADES AND STUFF
  .run(function(err, nightmare) {
    if (err) {
      console.log(err);
    }
    console.log('Done checking: ', unit;
    callback()
  });
}

async.eachSeries(orgUnits, check, function (err) {
  console.log('done!');
});
