var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
var moment = require("moment");

module.exports = async function () {
  const scheduleStage = [];
  let liveSeedType = "";

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

        result.tStartDate =
          result.tournamentId >= "401155413"
            ? new Date(`2020 ${monthDay}`)
            : new Date(`2019 ${monthDay}`);

        let f = new Date(`2020 ${monthDay}`);
        f.setDate(f.getDate() + 4);
        result.tEndDate = f;

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
        }

        // for Tour Championship
        if (result.purse === 0) {
          result.purse = 9500000;
        }

        scheduleStage.push(result);
      });
      return;
    });

  console.log("line 57", scheduleStage);
  let day = 0;

  // get status of tournament
  for (let i = 0; i < scheduleStage.length; i++) {
    const id = scheduleStage[i].tournamentId;
    console.log(id);
    var hold = {};
    await axios
      .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
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
          console.log("hold: ", hold);
        });
      });
    scheduleStage[i].status = hold.status;
    console.log("line 75", scheduleStage);

    // add/remove ! for testing/production
    if (/^Tournament Field/i.test(hold.status)) {
      const temp = await db.liveFieldSchedule.bulkCreate(scheduleStage);
      console.log("seeding liveFieldSchedule db tbl");
      module.exports.liveSeedType = "field";
      return;
    }

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
      scheduleStage.splice(i, 1);
      i--;
      console.log("deleting");
      return;
    }

    // false Freeze test - if status === "Final" but it's round 1/2/3 (really day 1/2/3), change status to correct day and add asterisk at end
    // add/remove ! for test/production version
    if (hold.status === "Final" && /[1-3]/.test(round)) {
      console.log("hold status change");
      scheduleStage[0].status = `Round ${day} - Play Complete*`;
    }

    console.log("current tournament included:", scheduleStage);
    finishedEventsArr = scheduleStage.filter(
      (el) => el.tournamentId >= "401155413"
    );
    console.log("finishedEventsArr", finishedEventsArr);

    console.log("seeding liveEventSchedule db tbl");
    module.exports.liveSeedType = "event";
    const temp = await db.liveEventSchedule.bulkCreate(finishedEventsArr);

    console.log("-----finished seeding liveEventSchedule table-----");
    return;
  }
};
