var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = async function () {
  const scheduleStage = [];
  let maxDate = [];
  let maxDateArr = [];

  // get details of current tournament
  await axios
    .get("https://www.espn.com/golf/schedule")
    .then(function (response) {
      var $ = cheerio.load(response.data);

      $(".mb5:nth-of-type(4) tbody tr").each(function (i, element) {
        var result = {};
        console.log("current tournament(s) scrape here");
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
        result.tStartDate =
          result.tournamentId >= "401155413"
            ? new Date(`2020 ${monthDay}`)
            : new Date(`2019 ${monthDay}`);

        let f = new Date(`2020 ${monthDay}`);
        f.setDate(f.getDate() + 4);
        result.tEndDate = f;
        result.name = $(this).find("p").text();
        result.winner = $(this).children("td:nth-child(3)").find("a").text();
        scheduleStage.push(result);
        console.log(scheduleStage);
      });
      return;
    });

  // is current tournament finished?
  for (let i = 0; i < scheduleStage.length; i++) {
    const id = scheduleStage[i].tournamentId;
    console.log(id);
    var hold = {};
    await axios
      .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
      .then(function (response) {
        var $ = cheerio.load(response.data);

        $(".status").each(function (i, element) {
          hold.status = $(this).find("span").text();
          console.log(hold);
        });
      });
    if (hold.status != "Final") {
      scheduleStage.splice(i, 1);
    }
    console.log("current tournament included:", scheduleStage);
  }

  await axios
    .get("https://www.espn.com/golf/schedule")
    .then(function (response) {
      var $ = cheerio.load(response.data);

      console.log("scraping completed tournaments");
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
        result.tStartDate =
          result.tournamentId >= "401155413"
            ? new Date(`2020 ${monthDay}`)
            : new Date(`2019 ${monthDay}`);

        let f = new Date(`2020 ${monthDay}`);
        f.setDate(f.getDate() + 4);
        result.tEndDate = f;
        result.name = $(this).find("p").text();
        result.winner = $(this).children("td:nth-child(3)").find("a").text();
        scheduleStage.push(result);
      });
      finishedEventsArr = scheduleStage
        .filter((el) => el.tournamentId >= "401155413")
        .filter((el) => el.winner);
      return;
    })
    .then(async function () {
      console.log("-----ready to seed ScheduleStage table------");
      const temp = await db.ScheduleStage.bulkCreate(finishedEventsArr);

      console.log("-----finished seeding ScheduleStage table-----");
      return;
    });
};
