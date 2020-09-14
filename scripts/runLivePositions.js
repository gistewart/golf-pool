require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];

  return (
    db.liveEventSchedule
      .findAll({
        attributes: ["tournamentId", "status"],
        raw: true,
      })
      // .then((tournamentIds) =>
      //   tournamentIds.map((tournament) => tournament.dataValues.tournamentId)
      // )

      .then(async function (tournamentIds) {
        console.log("new check: ", tournamentIds);
        for (let i = 0; i < tournamentIds.length; i++) {
          const id = tournamentIds[i].tournamentId;
          let statusAdj = 0;
          if (/^Round 1/.test(tournamentIds[i].status)) {
            statusAdj = -1;
            console.log(
              "******** round 1 status adjustment set to -1 ********"
            );
          }
          await axios
            .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
            .then(function (response) {
              var $ = cheerio.load(response.data);
              resultsArray = [];

              $("tbody tr").each(function (i, element) {
                var result = {};

                result.tournamentId = `${id}`;
                result.pos = $(this).children("td:first-child").text();
                result.posAdj = $(this)
                  .children("td:first-child")
                  .text()
                  .match(/\d+/g)
                  ? (result.posAdj = $(this)
                      .children("td:first-child")
                      .text()
                      .match(/\d+/g)[0])
                  : 0;
                // for any Round 1 status, subtracting 1 from nth-child for remaining properties
                result.playerName = $(this)
                  .children("td:nth-child(" + (3 + statusAdj) + ")")
                  .children("a")
                  .text();
                result.toPar = $(this)
                  .children("td:nth-child(" + (4 + statusAdj) + ")")
                  .text();
                if (result.pos == "-") {
                  result.pos = result.toPar;
                }
                // toParAdj for TC only
                result.toParAdj = $(this)
                  .children("td:nth-child(" + (4 + statusAdj) + ")")
                  .text()
                  .replace("E", 0)
                  .replace("+", "")
                  .replace("CUT", 0);
                result.today = $(this)
                  .children("td:nth-child(" + (5 + statusAdj) + ")")
                  .text();
                result.thru = $(this)
                  .children("td:nth-child(" + (6 + statusAdj) + ")")
                  .text();

                resultsArray.push(result);
              });
            });
        }
        console.log(
          `-----------finished runLivePositions for tournament -----------`
        );
        const arrToLoad = resultsArray.filter((el) => el.playerName);
        const temp = await db.livePosition.bulkCreate(arrToLoad);
      })
  );
};
