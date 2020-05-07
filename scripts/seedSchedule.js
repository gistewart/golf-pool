var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function () {
  const schedule = [];

  axios.get("https://www.espn.com/golf/schedule").then(function (response) {
    var $ = cheerio.load(response.data);

    $(".mb5:last-of-type tbody tr").each(function (i, element) {
      var result = {};

      result.tournamentID = $(this)
        .children("td:nth-child(2)")
        .find("a")
        .attr("href")
        .match(/(?<=\=).+/)[0];
      result.name = $(this).find("p").text();
      result.winner = $(this).children("td:nth-child(3)").find("a").text();

      schedule.push(result);
    });
    console.log("-----------finished seedSchedule------------");
    return db.Schedule.bulkCreate(schedule);
  });
};
