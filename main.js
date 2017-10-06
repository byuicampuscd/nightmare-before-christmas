/*eslint-env node, es6*/
/*global require*/
/*eslint no-console:0*/

var fs = require("fs"),
  dsv = require('d3-dsv'),
  Downloader = require("./download"),
  manager,
  exportPath = "./_exports",
  $async = require("async");

fs.readFile('courses.csv', 'utf8', (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  var courseList = dsv.csvParse(data).map((row) => {
    return row['OU#'];
  });

  console.log(courseList.length);
  /*console.log(courseList);
  return;*/


  manager = new Downloader(true);


  function iteratePairs(array, index, amount) {
    return function (process) {
      var goTo = (index + amount <= array.length) ? amount : (array.length);
      goTo += index;
      var currentItems = array.slice(index, goTo);
      currentItems = process(currentItems);
      $async.map(currentItems, manager.downloadCourse, function () {
        console.log("Finished!");
        fs.writeFile("bad_ous.txt", manager.bad, (err) => {
          if (err) throw err;
        });
        // debuggin cap
        //return;
        if (index + amount <= array.length)
          iteratePairs(array, index + amount, amount)(process);
      });
    }
  }

  //var items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  var it = iteratePairs(courseList, 0, 50);
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
});
