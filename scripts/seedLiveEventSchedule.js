var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
var moment = require("moment");

module.exports = async function () {
  const scheduleStage = [];
  let liveSeedType = "";
  const today = moment().format();
  // const today = moment("2021-01-01").format();
  const y = moment(today).year();

  // get details of current tournament
  await axios
    .get("https://www.espn.com/golf/schedule")
    .then(function (response) {
      var $ = cheerio.load(response.data);
      console.log("current tournament(s) scrape here");
      $(".mb5:nth-of-type(4) tbody tr").each(function (i, element) {
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

        result.name = $(this).find("p").text().replace(" - Play Suspended", "");
        result.name = $(this).find("p").text().replace(" - Suspended", "");
        result.winner = $(this).children("td:nth-child(3)").find("a").text();
        result.purse = Number(
          $(this)
            .children("td:nth-child(4)")
            .find("div")
            .text()
            .replace(/[\$,]/g, "")
        );
        // for purse correction
        if (/2020 Masters Tournament/i.test(result.name)) {
          result.purse = 11500000;
        } else if (/Tour Championship/i.test(result.name)) {
          result.purse = 15000000;
          result.name = "Tour Championship";
        } else if (
          /The Open Championship/i.test(result.name) &&
          !result.purse
        ) {
          result.purse = 12500000;
        } else if (/PGA Championship/i.test(result.name) && !result.purse) {
          result.purse = 15000000;
        } else if (!result.purse) {
          result.purse = 8000000;
        }

        scheduleStage.push(result);
      });
      return;
    });

  console.log("line 72", scheduleStage);
  let day = 0;

  // get status of tournament
  for (let i = 0; i < scheduleStage.length; i++) {
    // if event is a single day event, then delete it from scheduleStage array
    if (/-/.test(scheduleStage[i].tDate)) {
      console.log(scheduleStage[i].name, "multi-day");
    } else {
      console.log(scheduleStage[i].name, "single-day");
      scheduleStage.splice(i, 1);
      i--;
      console.log("line 84 deleting");
      continue;
    }

    // added on 3/23/2022
    for (let i = 0; i < scheduleStage.length; i++) {
      if (/WGC-Dell Technologies Match Play/.test(scheduleStage[i].name)) {
        scheduleStage.splice(i, 1);
        i--;
        console.log("deleting WGC on line 87");
        continue;
      }
    }

    const id = scheduleStage[i].tournamentId;
    console.log("line 96", id);
    var hold = {};
    var dataAvailable = {};
    await axios
      .get(`https://www.espn.com/golf/leaderboard/_/tournamentId/${id}`)
      .then(function (response) {
        var $ = cheerio.load(response.data);

        $(".status").each(function (i, element) {
          hold.status = $(this).children("span:first-child").text();
          console.log("hold: ", hold);
          hold.status = hold.status.replace(
            /First Round|Second Round|Third Round|Fourth Round|Final Round/gi,
            function ($0) {
              var index = {
                "First Round": "Round 1",
                "Second Round": "Round 2",
                "Third Round": "Round 3",
                "Fourth Round": "Round 4",
                "Final Round": "Round 4",
              };
              return index[$0] != undefined ? index[$0] : $0;
            }
          );
          console.log("line 120 hold: ", hold);
        });
        $("div.leaderboard_no_data").each(function (i, element) {
          dataAvailable.status = $(this).children("div:first-child").text();
        });
        console.log("dataAvailable: ", dataAvailable);
      });

    scheduleStage[i].status = hold.status;
    console.log("line 129", scheduleStage);

    // if dataAvailable field not empty (i.e. there is no data yet), then delete)
    if (Object.keys(dataAvailable).length) {
      scheduleStage.splice(i, 1);
      i--;
      console.log("line 135 deleting");
      return;
    } else if (hold.status.includes("Tournament Field")) {
      console.log("condition passed");

      console.log("scheduleStage[i]", scheduleStage[i]);
      // code to seed only scheduleStage[i] on each loop run
      const scheduleStageSingle = scheduleStage.slice(i, i + 1);
      try {
        const temp = await db.liveFieldSchedule.bulkCreate(scheduleStageSingle);
        console.log("seeding liveFieldSchedule db tbl");
      } catch (err) {
        console.log(err);
      }
      module.exports.liveSeedType = "field";
    }

    console.log("liveSeedType: ", liveSeedType);
    if (module.exports.liveSeedType !== "field") {
      console.log("liveSeedType: ", liveSeedType);
      const today = new Date();
      let a = moment(today, "M/D/YYYY");
      // const uset = moment.tz(today, "America/New_York");
      // day = uset.day();
      let startDate = scheduleStage[i].tStartDate;
      let b = moment(startDate, "M/D/YYYY");
      let round = a.diff(b, "days") + 1;
      console.log("today: ", a, "startDate: ", b, "round: ", round);

      // examples only of status: /Tournament Field|Final|Round 1 - Suspended | Round 1 - Play Complete|^Round [2-4]/

      // event not considered Live if status starts with 'Tournament' or status === "Final" AND it's round 4 (really day 4 or 5)
      // add/remove ! for test/production version
      if (
        /^Tournament/gi.test(hold.status) ||
        (hold.status === "Final" && /[45]/.test(round))
      ) {
        console.log(
          /^Tournament/gi.test(hold.status),
          hold.status === "Final",
          /[45]/.test(round)
        );
        scheduleStage.splice(i, 1);
        i--;
        console.log("line 172 deleting");
        return;
      }

      // false Freeze test - if status === "Final" but it's round 1/2/3 (really day 1/2/3), change status to correct day and add asterisk at end
      // add/remove ! for test/production version
      if (hold.status === "Final" && /[1-3]/.test(round)) {
        console.log("hold status change");
        scheduleStage[0].status = `Round ${day} - Play Complete*`;
      }

      console.log("current tournament included:", scheduleStage);
      liveEventsArr = scheduleStage.filter(
        (el) => el.tournamentId >= "401155413"
      );
      console.log("liveEventsArr", liveEventsArr);

      console.log("seeding liveEventSchedule db tbl");
      module.exports.liveSeedType = "event";
      // uncomment for Prod
      const temp = await db.liveEventSchedule.bulkCreate(liveEventsArr);

      console.log("-----finished seeding liveEventSchedule table-----");
      return;
    }
  }
};
