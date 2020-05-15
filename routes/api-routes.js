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
      attributes: ["handle"],
      include: [
        {
          model: db.Player,
          attributes: ["playerName", "tier"],
          include: [
            {
              model: db.Result,
              attributes: ["earnings"],
              include: [
                {
                  model: db.Schedule,
                  attributes: ["name"],
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

  //earnings by poolster by player
  app.get("/api/temp2", function (req, res) {
    db.Poolster.findAll({
      attributes: ["handle"],
      include: [
        {
          model: db.Player,
          attributes: [
            "playerId",
            [sequelize.fn("sum", sequelize.col("earnings")), "total_earnings"],
          ],
          include: {
            model: db.Result,
            attributes: [],
          },
        },
      ],
      raw: true,
      group: ["handle", "Poolster.poolsterId", "Players.playerId"],
    }).then((data) => {
      res.json(data);
    });
  });

  //earnings by poolster
  app.get("/api/temp5", function (req, res) {
    db.Poolster.findAll({
      attributes: ["handle"],
      include: [
        {
          model: db.Player,
          attributes: [
            [sequelize.fn("sum", sequelize.col("earnings")), "total_earnings"],
          ],
          through: { attributes: [] },
          include: {
            model: db.Result,
            attributes: [],
          },
        },
      ],
      // raw: true,
      group: ["handle", "Poolster.poolsterId"],
    }).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/temp3", function (req, res) {
    db.Poolster.findAll({
      include: [db.Player, db.Result, db.Schedule],
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
