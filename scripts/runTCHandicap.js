require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = async function () {
  let resultsArray = [];

  const id = 401353276;
  await axios
    .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
    .then(async function (response) {
      var $ = cheerio.load(response.data);
      resultsArray = [];

      $("tbody tr").each(function (i, element) {
        var result = {};

        result.tournamentId = `${id}`;
        result.pos = $(this).children("td:nth-child(2)").text();
        result.playerName = $(this)
          .children("td:nth-child(3)")
          .children("a")
          .text();
        result.toPar = $(this)
          .children("td:nth-child(4)")
          .text()
          .replace("E", 0)
          .replace("+", "");
        if (result.pos == "-") {
          result.pos = result.toPar;
        }
        result.today = $(this)
          .children("td:nth-child(5)")
          .text()
          .replace("E", 0)
          .replace("+", "");
        result.handicap = result.toPar - result.today;

        resultsArray.push(result);
      });

      // Uncomment for Production
      // return db.liveTCHandicap.bulkCreate(resultsArray);
    });
};
