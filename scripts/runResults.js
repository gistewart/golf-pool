require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];

  return db.missingTournament
    .findAll({
      attributes: ["tournamentId"],
    })
    .then((tournamentIds) =>
      tournamentIds.map((tournament) => tournament.dataValues.tournamentId)
    )

    .then(async function (tournamentIds) {
      for (let i = 0; i < tournamentIds.length; i++) {
        const id = tournamentIds[i];
        await axios
          .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
          .then(async function (response) {
            var $ = cheerio.load(response.data);
            resultsArray = [];

            $("tbody tr").each(function (i, element) {
              var result = {};

              result.tournamentId = `${id}`;
              result.pos = $(this).children("td:first-child").text();
              result.playerName = $(this)
                .children("td:nth-child(2)")
                .children("a")
                .text();
              result.toPar = $(this).children("td:nth-child(3)").text();
              if (result.pos == "-") {
                result.pos = result.toPar;
              }
              // Tour Championship if else statement
              if (id == 401056542) {
                result.Tot = Number(
                  $(this)
                    .children("td:nth-child(8)")
                    .text()
                    .replace(/[\$,]/g, "")
                    .replace(/--/, 0)
                );
              } else {
                result.earnings = Number(
                  $(this)
                    .children("td:nth-child(9)")
                    .text()
                    .replace(/[\$,]/g, "")
                    .replace(/--/, 0)
                );
              }

              resultsArray.push(result);
            });

            purseCalc();
            async function purseCalc() {
              const purseSplit = await db.livePurseSplit.findAll({
                where: {
                  class: {
                    [Op.eq]: "tc",
                  },
                },
                raw: true,
              });

              const sorted = resultsArray.sort((a, b) => a.Tot - b.Tot);

              // add posTC based on Tot
              sorted[0].posTC = 1;
              let ties = 0;
              for (let i = 1; i < sorted.length; i++) {
                if (sorted[i].Tot !== sorted[i - 1].Tot) {
                  sorted[i].posTC = i + 1;
                  ties = 0;
                } else {
                  ties++;
                  sorted[i].posTC = i + 1 - ties;
                }
              }

              // adds "T" for ties
              for (let i = 0; i < sorted.length; i++) {
                if (i === 0 && sorted[0].posTC === sorted[1].posTC) {
                  sorted[0].posTCDisplay = "T" + sorted[i].posTC;
                } else if (
                  i > 0 &&
                  i < sorted.length - 1 &&
                  (sorted[i].posTC === sorted[i - 1].posTC ||
                    sorted[i].posTC === sorted[i + 1].posTC)
                ) {
                  sorted[i].posTCDisplay = "T" + sorted[i].posTC;
                } else if (
                  i === sorted.length - 1 &&
                  sorted[i].posTC === sorted[i - 1].posTC
                ) {
                  sorted[i].posTCDisplay = "T" + sorted[i].posTC;
                } else {
                  sorted[i].posTCDisplay = sorted[i].posTC;
                }
              }

              // creates purseArr and counts the number of players at each position for the entire field
              let purseArr = [];
              for (let i in sorted) {
                let match = false;
                for (let j in purseArr) {
                  if (purseArr[j].pos === sorted[i].posTC) {
                    purseArr[j].data[0].count += 1;
                    match = true;
                    break;
                  }
                }
                if (!match) {
                  purseArr.push({
                    pos: sorted[i].posTC,
                    data: [{ count: 1 }],
                  });
                }
              }

              //calculates purse values for each position in purseArr
              let purseSize = 9500000;
              let purseSumComp = "";

              for (let i in purseArr) {
                if (purseArr[i].pos > 0) {
                  if (purseArr[i].data[0].count === 1) {
                    purseArr[i].data[0].avgPercent = Number(
                      purseSplit[purseArr[i].pos - 1].percent
                    );
                    purseArr[i].data[0].dollars =
                      (purseArr[i].data[0].avgPercent * purseSize) / 100;
                  } else {
                    purseSum = 0;
                    purseSumComp = "";
                    for (let j = 0; j < purseArr[i].data[0].count; j++) {
                      purseSum += Number(
                        purseSplit[Number(purseArr[i].pos) + j - 1].percent
                      );
                      purseSumComp =
                        purseSumComp +
                        purseSplit[purseArr[i].pos + j - 1].percent +
                        ", ";
                    }

                    purseArr[i].data[0].comp = purseSumComp;
                    purseArr[i].data[0].totPercent = purseSum;
                    purseArr[i].data[0].avgPercent =
                      purseSum / purseArr[i].data[0].count;
                    purseArr[i].data[0].dollars =
                      (purseArr[i].data[0].avgPercent * purseSize) / 100;
                  }
                }
              }

              let purseSumCheck = 0;
              for (let i in purseArr) {
                purseSumCheck +=
                  purseArr[i].data[0].count * purseArr[i].data[0].dollars;
              }

              console.log(purseSumCheck);

              for (let i in purseArr) {
                console.log(purseArr[i].pos, purseArr[i].data);
              }

              // add purse info to sorted array
              for (let i in sorted) {
                for (let j in purseArr) {
                  if (sorted[i].posTC === purseArr[j].pos) {
                    sorted[i].avgPercent = purseArr[j].data[0].avgPercent;
                    sorted[i].dollars = purseArr[j].data[0].dollars;
                    break;
                  }
                }
              }

              //adding fields to sorted array
              let Par = 280;
              let toParTC = 0;
              for (let i in sorted) {
                sorted[i].toParTC = sorted[i].Tot - Par;
                sorted[i].toParTCDisplay =
                  sorted[i].toParTC === 0
                    ? "E"
                    : sorted[i].toParTC > 0
                    ? "+" + sorted[i].toParTC
                    : sorted[i].toParTC;
                sorted[i].toParAdj = sorted[i].toPar
                  .replace(/\+/, "")
                  .replace(/E/, 0);
                sorted[i].handicap = sorted[i].toParAdj - sorted[i].toParTC;
              }

              console.log(sorted);
            }

            return db.Player.findAll({
              attributes: ["playerName"],
            })

              .then((playerNames) =>
                playerNames.map((player) => player.dataValues.playerName)
              )

              .then((playerNames) => {
                const filtered = resultsArray.filter((el) =>
                  playerNames.includes(el.playerName)
                );
                console.log(
                  `-----------finished runResults for tournament ${id}------------`
                );
                // return db.Result.bulkCreate(filtered);
              });
          });
      }
    });
};
