var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = async function () {
  const scheduleStage = [];

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
        result.name = $(this).find("p").text();
        result.winner = $(this).children("td:nth-child(3)").find("a").text();
        result.purse = Number(
          $(this)
            .children("td:nth-child(4)")
            .find("div")
            .text()
            .replace(/[\$,]/g, "")
        );

        scheduleStage.push(result);
      });
      return;
    });

  console.log("line 53", scheduleStage);

  // has Round 1 of current tournament been completed
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
        });
      });
    scheduleStage[i].status = hold.status;
    if (
      // !/Tournament Field|Final|Round 1 - Play Complete|^Round [2-4]/gi.test(
      !/^Round [1-4]/gi.test(hold.status)
    ) {
      scheduleStage.splice(i, 1);
      i--;
      console.log("deleting");
    }
  }

  console.log("current tournament included:", scheduleStage);
  finishedEventsArr = scheduleStage.filter(
    (el) => el.tournamentId >= "401155413"
  );
  console.log("finishedEventsArr", finishedEventsArr);

  console.log("-----ready to seed liveEventSchedule table------");
  const temp = await db.liveEventSchedule.bulkCreate(finishedEventsArr);

  console.log("-----finished seeding liveEventSchedule table-----");
  return;
};
