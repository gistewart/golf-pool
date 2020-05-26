require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];

  return db.Schedule.findAll({
    attributes: ["tournamentId"],
    where: {
      tournamentId: {
        // [Op.gte]: 401148233,
        [Op.gte]: 401155413,
        // [Op.lte]: 401148234,
      },
      winner: {
        [Op.regexp]: "^[A-Z]",
      },
    },
  })
    .then((tournamentIds) =>
      tournamentIds.map((tournament) => tournament.dataValues.tournamentId)
    )

    .then(async function (tournamentIds) {
      for (let i = 0; i < tournamentIds.length; i++) {
        const id = tournamentIds[i];
        await axios
          .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
          .then(function (response) {
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
              if (result.toPar == "CUT") {
                result.pos = "MC";
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
                  `-----------finished seedResults for tournament ${id}------------`
                );
                return db.Result.bulkCreate(filtered);
              });
          });
      }
    });
};
