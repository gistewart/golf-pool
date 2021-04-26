require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = async function () {
  let resultsArray = [];

  // 1 tournament at a time
  // edit url
  // edit tournamentId, name, startDate
  // uncomment db load
  await axios
    .get(
      `https://www.pgatour.com/content/pgatour/stats/stat.194.y2021.eon.t536.html`
    )
    .then(async function (response) {
      var $ = cheerio.load(response.data);
      resultsArray = [];

      $("tbody tr").each(function (i, element) {
        var result = {};

        result.tournamentId = "401155468";
        result.name = "Barracuda Championship";
        result.startDate = "2020-07-30 00:00:00";
        result.pos = $(this)
          .children("td:first-child")
          .text()
          .replace(/^[\s]+/g, "");
        result.playerNameX = $(this)
          .children("td:nth-child(3)")
          .text()
          .replace(/^[\s]+/g, "")
          .replace(/[\s]+$/g, "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        result.toPar = "";
        result.earnings = Number(
          $(this)
            .children("td:nth-child(5)")
            .text()
            .replace(/[\$,]/g, "")
            .replace(/--/, 0)
        );
        resultsArray.push(result);
      });

      const filtered = resultsArray.filter((el) => el.playerNameX);
      console.log("filtered: ", filtered);
      console.log(`-----------finished runResults for tournament------------`);
      // Uncomment for Production
      // return db.ResultAll.bulkCreate(filtered);
    });
};
