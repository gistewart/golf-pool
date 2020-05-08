require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];

  return db.Schedule.findAll({
    attributes: ["tournamentID"],
    where: {
      tournamentID: {
        [Op.gte]: 401155413,
        [Op.lte]: 401155419,
      },
      winner: {
        [Op.regexp]: "^[A-Z]",
      },
    },
  })
    .then((tournamentIDs) =>
      tournamentIDs.map((tournament) => tournament.dataValues.tournamentID)
    )

    .then(async function (tournamentIDs) {
      for (let i = 0; i < tournamentIDs.length; i++) {
        const id = tournamentIDs[i];
        await axios
          .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
          .then(function (response) {
            var $ = cheerio.load(response.data);
            resultsArray = [];

            $("tbody tr").each(function (i, element) {
              var result = {};

              result.tournamentID = `${id}`;
              result.pos = $(this).children("td:first-child").text();
              result.playerName = $(this)
                .children("td:nth-child(2)")
                .children("a")
                .text();
              result.toPar = $(this).children("td:nth-child(3)").text();
              result.earnings = $(this).children("td:nth-child(9)").text();
              resultsArray.push(result);
            });

            return db.Players.findAll({
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
                  `-----------finished seedResults for tournament ${id}------------`
                );
                return db.Results.bulkCreate(filtered);
              });
          });
      }
    });
};
