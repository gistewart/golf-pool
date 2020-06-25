var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = async function () {
  const scheduleStage = [];
  let maxDate = [];
  let maxDateArr = [];

  // current tournaments check
  await axios
    .get("https://www.espn.com/golf/schedule")
    .then(function (response) {
      var $ = cheerio.load(response.data);

      $(".mb5:nth-of-type(4) tbody tr").each(function (i, element) {
        var result = {};
        console.log("current tournaments scrape here");
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
    console.log("line 64:" + scheduleStage);
  }

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
        scheduleStage.push(result);
      });
      console.log(scheduleStage);
      maxDateArr = scheduleStage
        .filter((el) => el.tournamentId >= "401155413")
        .filter((el) => el.winner);
      // .reduce((a, b) => {
      // return a.tStartDate > b.tStartDate ? a : b;
      // });
      // maxDateArr.push(maxDate);
      // console.log("----------maxDate--------:", maxDate);
      console.log("----------maxDateArr--------:", maxDateArr);
      return;
    })
    .then(async function () {
      console.log("-----------finishing seedScheduleStage------------");
      // console.log(scheduleStage);
      const temp3 = await db.ScheduleStage.bulkCreate(maxDateArr);

      console.log("-----------finished  seedScheduleStage------------");
      return;
    });
};
