var db = require("../models");
var sequelize = require("sequelize");

//Get Earnings
module.exports = function (app) {
  app.get("/api/poolsters", function (req, res) {
    db.Poolster.findAll({}).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/schedule", function (req, res) {
    db.Schedule.findAll({}).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/temp", function (req, res) {
    db.Poolster.findAll({
      include: [
        {
          model: db.PoolsterPlayers,
          include: [
            {
              model: db.Player,
              include: [
                {
                  model: db.Result,
                  include: [
                    {
                      model: db.Schedule,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }).then((data) => {
      res.json(data);
    });
  });

  // app.get("/api/results", function (req, res) {
  //   db.Results.findAll({
  //     attributes: [
  //       "playerName",
  //       [sequelize.fn("sum", sequelize.col("earnings")), "total_earnings"],
  //     ],
  //     include: {
  //       model: db.Players,
  //       attributes: ["playerId", "tier"],
  //     },
  //     group: ["Results.playerName"],
  //     order: sequelize.literal("total_earnings DESC"),
  //   }).then((data) => {
  //     res.json(data);
  //   });
  // });
};
