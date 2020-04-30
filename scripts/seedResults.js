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
      endDate: {
        [Op.lt]: new Date(),
      },
    },
  })
    .then((tournamentIDs) =>
      tournamentIDs.map((tournament) => tournament.dataValues.tournamentID)
    )
    .then((tournamentIDs) => {
      const apiPromises = tournamentIDs.map((id) => {
        return axios
          .get(`https://www.espn.com/golf/leaderboard?tournamentId=${id}`)
          .then(function (response) {
            var $ = cheerio.load(response.data);
            resultsArray = [];

            $("tbody tr").each(function (i, element) {
              var result = {};

              result.tournamentID = `${id}`;
              result.pos = $(this).children("td:first-child").text();
              result.name = $(this)
                .children("td:nth-child(2)")
                .children("a")
                .text();
              result.toPar = $(this).children("td:nth-child(3)").text();
              result.earnings = $(this).children("td:nth-child(9)").text();
              resultsArray.push(result);
            });

            return db.Results.bulkCreate(resultsArray);
          });
      });

      return Promise.all(apiPromises);
    });
};
