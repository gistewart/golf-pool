require("dotenv").config();
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
const { Op } = require("sequelize");

module.exports = function () {
  let resultsArray = [];
  const date = "2020-01-10 09:30:00";
  const myDate = new Date(date);

  return db.Schedule.findAll({
    attributes: ["tournamentID"],
    where: {
      endDate: {
        // [Op.lt]: new Date(),
        [Op.lt]: myDate,
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

                return db.Results.bulkCreate(filtered);
              });
          });
      });

      return Promise.all(apiPromises);
    });
};

//               resultsArray.push(result);
//             });

//             return db.Results.bulkCreate(resultsArray);
//           });
//       });

//       return Promise.all(apiPromises);
//     });
// };
