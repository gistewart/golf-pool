require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];

  return db.liveEventSchedule
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
              resultsArray.push(result);
            });
          });
      }
      console.log(
        `-----------finished runLiveResults for tournament -----------`
      );
      const arrToLoad = resultsArray.filter((el) => el.playerName);
      const temp = await db.liveResult.bulkCreate(arrToLoad);
    });
};
