var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
var moment = require("moment");

module.exports = async function () {
  const schedule = [];
  const today = moment().format();
  const y = moment(today).year();

  await axios
    .get("https://www.espn.com/golf/schedule")
    .then(function (response) {
      var $ = cheerio.load(response.data);

      $(".mb5:last-of-type tbody tr").each(function (i, element) {
        var result = {};

        result.tournamentId = $(this).children("td:nth-child(2)").find("a")
          .length
          ? (result.tournamentId = $(this)
              .children("td:nth-child(2)")
              .find("a")
              .attr("href")
              .match(/(?<=\=).+/)[0])
          : "000000000";

        result.tDate = $(this).children("td:first-child").text();
        let monthDay = $(this)
          .children("td:first-child")
          .text()
          .match(/[A-Z]{3} [0-9]{1,2}/gi)[0];

        const dateString = y + ` ${monthDay}`;
        tStartDate = moment(dateString, "YYYY MMM DD");
        result.tStartDate = tStartDate;
        result.tEndDate = moment(tStartDate).add(4, "d");

        result.name = $(this).find("p").text();
        result.winner = $(this).children("td:nth-child(3)").find("a").text();
        if (result.tStartDate > moment([2020, 10, 8]) && result.winner) {
          schedule.push(result);
        }
      });
      console.log(schedule);
      return;
    })
    .then(function () {
      console.log("-----------finished seedSchedule------------");
      return db.ScheduleOther.bulkCreate(schedule);
    });
};
