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

        // to exclude the Barracuda while it is taking place
        if (result.tournamentId !== "401155468") {
          scheduleStage.push(result);
        }
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
      i--;
      console.log("current tournament included:", scheduleStage);
    }
    //have earnings been posted for all players who made the cut
    else {
      await axios
        .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
        .then(function (response) {
          var $ = cheerio.load(response.data);
          resultsArray = [];

          $("tbody tr").each(function (i, element) {
            var result = {};

            result.tournamentId = `${id}`;
            result.pos = $(this)
              .children("td:first-child")
              .text()
              .replace(/^T/, "");
            result.playerName = $(this)
              .children("td:nth-child(2)")
              .children("a")
              .text();
            result.toPar = $(this).children("td:nth-child(3)").text();
            if (result.pos == "-") {
              result.pos = result.toPar;
            }
            result.earnings = Number(
              $(this)
                .children("td:nth-child(9)")
                .text()
                .replace(/[\$,]/g, "")
                .replace(/--/, 0)
            );
            resultsArray.push(result);
          });
        });
      // console.log("new results: ", resultsArray);
      for (let j = 0; j < resultsArray.length; j++) {
        console.log(
          resultsArray[j].pos,
          resultsArray[j].playerName,
          resultsArray[j].earnings
        );
        // this is where the magic happens!
        if (!isNaN(resultsArray[j].pos) && resultsArray[j].earnings === 0) {
          console.log("break now");
          scheduleStage.splice(i, 1);
          i--;
          break;
        }
      }
    }
    console.log("current tournament included:", scheduleStage);
  }

  //now grab details of completed tournaments
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

      //filter for this year's events; (not the Barracuda;) presence of a winner
      finishedEventsArr = scheduleStage
        .filter((el) => el.tournamentId >= "401155413")
        // .filter((el) => el.tournamentId !== "401155468")
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
