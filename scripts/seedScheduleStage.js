var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
var moment = require("moment");
const e = require("express");

module.exports = async function () {
  const scheduleStage = [];
  let maxDate = [];
  let maxDateArr = [];
  const today = moment().format();
  // const today = moment("2023-01-01").format();
  const y = moment(today).year();

  // BEGINNING OF SECTION 1
  // get details of current tournament
  await axios
    .get("https://www.espn.com/golf/schedule")
    .then(function (response) {
      var $ = cheerio.load(response.data);
      // 2022 change was typeof(4); originally (5)
      $(".mb5:nth-of-type(4) tbody tr").each(function (i, element) {
        var result = {};
        console.log("line 24: current tournament(s) scrape here");
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

        // to exclude the Barracuda / WGC-Dell while it is taking place
        if (
          // result.tournamentId !== "401243406" &&
          // result.tournamentId !== "401243007"
          result.tournamentId !== "401353293" ||
          result.tournamentId !== "401353216"
        ) {
          // console.log("----------deleting WGC/Barra here-----------");
          scheduleStage.push(result);
        }
      });

      // console.log(
      //   "-------------end of Section 1 array----------------: ",
      //   scheduleStage
      // );
      return;
    });
  // END OF SECTION 1
  console.log("line 61", scheduleStage);

  // BEGINNING OF SECTION 2
  // is current tournament finished?
  for (let i = 0; i < scheduleStage.length; i++) {
    const id = scheduleStage[i].tournamentId;
    console.log("section 2 id: ", id);
    var hold = {};
    await axios
      .get(`https://www.espn.com/golf/leaderboard/_/tournamentId/${id}`)
      .then(function (response) {
        var $ = cheerio.load(response.data);

        $(".status").each(function (i, element) {
          hold.status = $(this).find("span").text();
          console.log("section 2 hold status: ", hold);
        });
      });
    if (hold.status != "Final") {
      console.log("tourney not final, so about to delete");
      scheduleStage.splice(i, 1);
      i--;
      // console.log("array after deletion:", scheduleStage);
    }
    // have earnings been posted for all players who made the cut x
    else {
      await axios
        .get(`https://www.espn.com/golf/leaderboard/_/tournamentId/${id}`)
        .then(function (response) {
          var $ = cheerio.load(response.data);
          resultsArray = [];

          $(".ResponsiveTable:not(.leaderboard__playoff--table) tbody tr").each(
            function (i, element) {
              var result = {};

              result.tournamentId = `${id}`;
              result.pos = $(this)
                .children("td:nth-child(2)")
                .text()
                .replace(/^T/, "");
              result.playerName = $(this)
                .children("td:nth-child(3)")
                .children("a")
                .text();
              result.toPar = $(this).children("td:nth-child(4)").text();
              if (result.pos == "-") {
                result.pos = result.toPar;
              }
              result.earnings = Number(
                $(this)
                  .children("td:nth-child(10)")
                  .text()
                  .replace(/[\$,]/g, "")
                  .replace(/--/, 0)
              );
              resultsArray.push(result);
            }
          );
        });
      // console.log("earnings posted check: ", resultsArray);
      for (let j = 0; j < resultsArray.length; j++) {
        // console.log(
        //   resultsArray[j].pos,
        //   resultsArray[j].playerName,
        //   resultsArray[j].earnings
        // );
        // this is where the magic happens!
        // to exclude amateurs from the earnings check
        if (/.*\(a\)$/i.test(resultsArray[j].playerName)) {
          continue;
        }
        // to delete tourney if any pros who made cut have earnings of 0
        // console.log(
        //   "line 130",
        //   Number.isInteger(resultsArray[j].pos),
        //   resultsArray[j].earnings
        // );
        if (
          Number.isInteger(Number(resultsArray[j].pos)) &&
          resultsArray[j].earnings == 0
        ) {
          console.log("breaking now because all earnings have not been posted");
          scheduleStage.splice(i, 1);
          i--;
          break;
        }
      }
    }
    // console.log("end of Section 2 array: ", scheduleStage);
  }
  // END OF SECTION 2

  // BEGINNING OF SECTION 3
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

        const dateString = y + ` ${monthDay}`;
        tStartDate = moment(dateString, "YYYY MMM DD");
        result.tStartDate = tStartDate;
        result.tEndDate = moment(tStartDate).add(4, "d");

        result.name = $(this).find("p").text();
        result.winner = $(this).children("td:nth-child(3)").find("a").text();
        scheduleStage.push(result);
      });

      //filter for this year's events then for presence of a winner
      finishedEventsArr = scheduleStage
        .filter(
          (el) => el.tournamentId >= "401465512"
          // && el.tournamentId !== "401366873"
        )
        // problem with below line as current year applied to date
        .filter((el) => moment(el.tStartDate).year() == y)
        .filter((el) => el.winner);

      return;
    })
    // END OF SECTION 3

    .then(async function () {
      // console.log("version of array to be sent to db: ", finishedEventsArr);
      console.log("-----ready to seed ScheduleStage table------");
      const temp = await db.ScheduleStage.bulkCreate(finishedEventsArr);

      console.log("-----finished seeding ScheduleStage table-----");
      return;
    });
};
