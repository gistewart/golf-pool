require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];

  return db.ScheduleOther.findAll({
    attributes: ["tournamentId", "tStartDate", "name"],
    raw: true,
    where: {
      winner: {
        [Op.regexp]: "^[A-Z]",
      },
    },
  }).then(async function (tourney) {
    console.log(tourney);
    for (let i = 0; i < tourney.length; i++) {
      const id = tourney[i].tournamentId;
      const name = tourney[i].name;
      const startDate = tourney[i].tStartDate;
      await axios
        .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
        .then(async function (response) {
          var $ = cheerio.load(response.data);
          resultsArray = [];

          $("tbody tr").each(function (i, element) {
            var result = {};

            result.tournamentId = `${id}`;
            result.name = `${name}`;
            result.startDate = `${startDate}`;
            result.pos = $(this).children("td:first-child").text();
            result.playerNameX = $(this)
              .children("td:nth-child(2)")
              .children("a")
              .text();
            result.toPar = $(this).children("td:nth-child(3)").text();
            if (result.pos == "-") {
              result.pos = result.toPar;
            }
            if (result.pos == "CUT") {
              result.pos = "MC";
            }
            // Tour Championship if else statement
            if (/tour championship/i.test(name)) {
              result.tot = Number(
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

          // TC purse calc function
          async function purseCalc() {
            const purseSplit = await db.livePurseSplit.findAll({
              where: {
                class: {
                  [Op.eq]: "tc",
                },
              },
              raw: true,
            });

            resultsArray = resultsArray.sort((a, b) => a.tot - b.tot);

            // add posTC based on tot
            resultsArray[0].posTC = 1;
            let ties = 0;
            for (let i = 1; i < resultsArray.length; i++) {
              if (resultsArray[i].tot !== resultsArray[i - 1].tot) {
                resultsArray[i].posTC = i + 1;
                ties = 0;
              } else {
                ties++;
                resultsArray[i].posTC = i + 1 - ties;
              }
            }

            // adds "T" for ties
            for (let i = 0; i < resultsArray.length; i++) {
              if (i === 0 && resultsArray[0].posTC === resultsArray[1].posTC) {
                resultsArray[0].posTCDisplay = "T" + resultsArray[i].posTC;
              } else if (
                i > 0 &&
                i < resultsArray.length - 1 &&
                (resultsArray[i].posTC === resultsArray[i - 1].posTC ||
                  resultsArray[i].posTC === resultsArray[i + 1].posTC)
              ) {
                resultsArray[i].posTCDisplay = "T" + resultsArray[i].posTC;
              } else if (
                i === resultsArray.length - 1 &&
                resultsArray[i].posTC === resultsArray[i - 1].posTC
              ) {
                resultsArray[i].posTCDisplay = "T" + resultsArray[i].posTC;
              } else {
                resultsArray[i].posTCDisplay = resultsArray[i].posTC;
              }
            }

            // creates purseArr and counts the number of players at each position for the entire field
            let purseArr = [];
            for (let i in resultsArray) {
              let match = false;
              for (let j in purseArr) {
                if (purseArr[j].pos === resultsArray[i].posTC) {
                  purseArr[j].data[0].count += 1;
                  match = true;
                  break;
                }
              }
              if (!match) {
                purseArr.push({
                  pos: resultsArray[i].posTC,
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
                  purseArr[i].data[0].earnings =
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
                  purseArr[i].data[0].earnings =
                    (purseArr[i].data[0].avgPercent * purseSize) / 100;
                }
              }
            }

            let purseSumCheck = 0;
            for (let i in purseArr) {
              purseSumCheck +=
                purseArr[i].data[0].count * purseArr[i].data[0].earnings;
            }

            console.log(purseSumCheck);

            // add purse info to resultsArray
            for (let i in resultsArray) {
              for (let j in purseArr) {
                if (resultsArray[i].posTC === purseArr[j].pos) {
                  resultsArray[i].avgPercent = purseArr[j].data[0].avgPercent;
                  resultsArray[i].earnings = purseArr[j].data[0].earnings;
                  break;
                }
              }
            }

            //adding helpful fields to resultsArray
            let Par = 280;
            let toParTC = 0;
            for (let i in resultsArray) {
              resultsArray[i].toParTC = resultsArray[i].tot - Par;
              resultsArray[i].toParTCDisplay =
                resultsArray[i].toParTC === 0
                  ? "E"
                  : resultsArray[i].toParTC > 0
                  ? "+" + resultsArray[i].toParTC
                  : resultsArray[i].toParTC;
              resultsArray[i].toParAdj = resultsArray[i].toPar
                .replace(/\+/, "")
                .replace(/E/, 0);
              resultsArray[i].handicap =
                resultsArray[i].toParAdj - resultsArray[i].toParTC;
            }
            console.log("for db.ResultTC: ", resultsArray);

            // Uncomment for Production
            // await db.ResultTC.sync({ force: true });
            // await db.ResultTC.bulkCreate(resultsArray);

            for (let i in resultsArray) {
              resultsArray[i].pos = resultsArray[i].posTCDisplay;
              resultsArray[i].toPar = resultsArray[i].toParTCDisplay;
            }
          }

          const secondFunction = async () => {
            if (/tour championship/i.test(name)) {
              const first = await purseCalc();
            }

            const filtered = resultsArray.filter((el) => el.playerNameX);
            console.log("filtered: ", filtered);
            console.log(
              `-----------finished running results for tournament ${id}------------`
            );
            // Uncomment for Production
            return db.ResultAll.bulkCreate(filtered);
          };
          secondFunction();
        });
    }
  });
};
