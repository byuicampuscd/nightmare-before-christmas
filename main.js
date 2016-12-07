/*global require, console*/
var fs = require("fs"),
    Downloader = require("./download"),
    courselist = JSON.parse(fs.readFileSync("./courses.json")),
    manager,
    exportPath = "./_exports",
    $async = require("async");
console.log(courselist.courses.length);

manager = new Downloader(true);


function iteratePairs(array, index, amount) {
    return function (process) {
        var goTo = (index + amount <= array.length) ? amount : (array.length);
        goTo += index;
        var currentItems = array.slice(index, goTo);
        currentItems = process(currentItems);
        $async.map(currentItems, manager.downloadCourse, function () {
            console.log("Finished!");
            fs.writeFile("bad_ous.txt", manager.bad, (err) =>{if(err) throw err;});
            // debuggin cap
            //return;
            if (index + amount <= array.length)
                iteratePairs(array, index + amount, amount)(process);
        });
    }
}

var items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
var it = iteratePairs(courselist.courses, 0, 50);
manager.setCookies(function () {
    it(function (items) {
        var newA = items.map(function (item) {
            return {
                org: item.ou,
                path: exportPath,
                me: manager
            };

        });
        console.log(newA);
        return newA;
    });
});