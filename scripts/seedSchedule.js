var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function () {
  const schedule = [];

  axios.get("https://www.espn.com/golf/schedule").then(function (response) {
    var $ = cheerio.load(response.data);
    console.log("-------1---------");

    $(".mb5:last-of-type tbody tr").each(function (i, element) {
      var result = {};

      result.tournamentID = $(this)
        .children("td:nth-child(2)")
        .find("a")
        .attr("href")
        .match(/(?<=\=).+/)[0];
      result.startDate = $(this)
        .children("td:first-child")
        .text()
        .match(/.+(?=-)/)[0];
      result.name = $(this).find("p").text();
      result.winner = $(this).children("td:nth-child(3)").find("a").text();
      result.canceled = $(this)
        .children("td:nth-child(3)")
        .children("div")
        .children("div")
        .text();

      // console.log("-------------------------");
      console.log(result);

      schedule.push(result);
    });
    // console.log("--------schedule----------");
    // console.log(schedule);
    // return db.playerForm.bulkCreate(schedule);
  });
};

// require("dotenv").config();
// var fetch = require("node-fetch");
// var db = require("../models");

// var schedule = [
//   {
//     tournamentID: "401155413",
//     name: "Sentry Tournament of Champions",
//     startDate: "2020-01-02",
//     endDate: "2020-01-05",
//   },
//   {
//     tournamentID: "401155418",
//     name: "Sony Open in Hawaii",
//     startDate: "2020-01-09",
//     endDate: "2020-01-12",
//   },
//   {
//     tournamentID: "401155419",
//     name: "The American Express",
//     startDate: "2020-01-16",
//     endDate: "2020-01-19",
//   },
//   {
//     tournamentID: "401155420",
//     name: "Farmers Insurance Open",
//     startDate: "2020-01-23",
//     endDate: "2020-01-26",
//   },
//   {
//     tournamentID: "401155421",
//     name: "Waste Management Phoenix Open",
//     startDate: "2020-01-30",
//     endDate: "2020-02-02",
//   },
// ];

// module.exports = function () {
//   return db.Schedule.bulkCreate(schedule);
// };
