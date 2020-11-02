var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = async function () {
  const schedule = [];

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
        // console.log(monthDay);
        result.tStartDate =
          result.tournamentId >= "401155413"
            ? new Date(`2020 ${monthDay}`)
            : new Date(`2019 ${monthDay}`);

        let f = new Date(`2020 ${monthDay}`);
        f.setDate(f.getDate() + 4);
        result.tEndDate = f;
        result.name = $(this).find("p").text();
        result.winner = $(this).children("td:nth-child(3)").find("a").text();
        // console.log(result);
        schedule.push(result);
      });
      return;
    })
    .then(function () {
      console.log("-----------finished seedSchedule------------");
      return db.ScheduleOther.bulkCreate(schedule);
    });
};
