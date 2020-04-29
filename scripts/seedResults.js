var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function () {
  const resultsArray = [];

  axios
    .get("https://www.espn.com/golf/leaderboard?tournamentId=401155418")
    .then(function (response) {
      var $ = cheerio.load(response.data);

      $("tbody tr").each(function (i, element) {
        var result = {};

        result.pos = $(this).children("td:first-child").text();

        result.name = $(this).children("td:nth-child(2)").children("a").text();

        result.toPar = $(this).children("td:nth-child(3)").text();

        result.earnings = $(this).children("td:nth-child(9)").text();

        console.log("-------------------------");
        console.log(result);

        resultsArray.push(result);
      });
      // console.log("--------resultsArray----------");
      // console.log(resultsArray);
      //   return db.playerForm.bulkCreate(resultsArray);
    });
};
