require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];

  return db.liveFieldSchedule
    .findAll({
      attributes: ["tournamentId", "name"],
      raw: true,
    })

    .then(async function (tourney) {
      console.log(tourney);
      for (let i = 0; i < tourney.length; i++) {
        const id = tourney[i].tournamentId;
        const name = tourney[i].name;
        await axios
          .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
          .then(async function (response) {
            var $ = cheerio.load(response.data);
            resultsArray = [];

            $("tbody tr").each(function (i, element) {
              var result = {};

              result.tournamentId = `${id}`;
              result.playerName = $(this).children("td:first-child").text();
              result.teeTime = $(this).children("td:nth-child(2)").text();
              resultsArray.push(result);
            });
            // console.log(resultsArray);

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
                // console.log("filtered: ", filtered);
                console.log(
                  `-----------finished runResults for tournament ${id}------------`
                );
                // Uncomment for Production
                return db.liveField.bulkCreate(filtered);
              });
          });
      }
    });
};
