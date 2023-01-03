require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];
  console.log("------------line 9------------");
  // let tournamentId = 401242996;

  return (
    db.liveEventSchedule
      .findAll({
        attributes: ["tournamentId", "status", "name"],
        order: [["purse", "desc"]],
        raw: true,
      })
      // .then((tournamentIds) =>
      //   tournamentIds.map((tournament) => tournament.dataValues.tournamentId)
      // )

      .then(async function (tournamentIds) {
        console.log("new check: ", tournamentIds);
        // to get positions of just the first tournament (i.e. not the opposite field event)
        for (let i = 0; i < tournamentIds.length, i < 1; i++) {
          const id = tournamentIds[i].tournamentId;
          const name = tournamentIds[i].name;
          console.log(name);
          let statusAdj = 0;
          if (/^Round 1/.test(tournamentIds[i].status)) {
            statusAdj = -1;
            console.log(
              "******** round 1 status adjustment set to -1 ********"
            );
          }
          await axios
            .get(`https://www.espn.com/golf/leaderboard/_/tournamentId/${id}`)
            .then(function (response) {
              var $ = cheerio.load(response.data);
              resultsArray = [];

              $(
                ".ResponsiveTable:not(.leaderboard__playoff--table) tbody tr"
              ).each(function (i, element) {
                var result = {};

                result.tournamentId = `${id}`;
                result.pos = $(this).children("td:nth-child(2)").text();
                result.posAdj = $(this)
                  .children("td:nth-child(2)")
                  .text()
                  .match(/\d+/g)
                  ? (result.posAdj = $(this)
                      .children("td:nth-child(2)")
                      .text()
                      .match(/\d+/g)[0])
                  : 0;
                // for any Round 1 status, subtracting 1 from nth-child for remaining properties
                result.playerName = $(this)
                  .children("td:nth-child(" + (4 + statusAdj) + ")")
                  .children("a")
                  .text();
                result.toPar = $(this)
                  .children("td:nth-child(" + (5 + statusAdj) + ")")
                  .text();

                if (result.pos === "-" && result.toPar !== "CUT") {
                  result.pos = result.toPar;
                } else if (result.pos === "-") {
                  result.pos = "MC";
                }

                // if (result.pos == "-") {
                //   result.pos = result.toPar;
                // } else if (result.pos == "CUT") {
                //   result.pos = "MC";
                // }

                // toParAdj for TC only (not sure about last replace method below, intended for any WD or DQ?)
                if (name == "Tour Championship") {
                  result.toParAdj = $(this)
                    .children("td:nth-child(" + (5 + statusAdj) + ")")
                    .text()
                    .replace("E", 0)
                    .replace("+", "")
                    .replace(/WD/gi, 99);
                }

                result.today = $(this)
                  .children("td:nth-child(" + (6 + statusAdj) + ")")
                  .text();
                result.thru = $(this)
                  .children("td:nth-child(" + (7 + statusAdj) + ")")
                  .text();

                resultsArray.push(result);
              });
            });
        }
        console.log("----------------line 100---------------");
        // console.log(resultsArray);
        console.log(
          `-----------finished runLivePositions for tournament -----------`
        );
        const arrToLoad = resultsArray.filter((el) => el.playerName);
        const temp = await db.livePosition.bulkCreate(arrToLoad);
      })
  );
};
