var db = require("../models");
var sequelize = require("sequelize");
const { Op } = require("sequelize");

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

  app.get("/api/test", function (req, res) {
    db.Poolster.findAll({
      attributes: ["handle"],
      include: [
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          attributes: ["startDate"],
          include: [
            {
              model: db.Player,
              as: "Player",
              attributes: ["playerName"],
              include: [
                {
                  model: db.Result,
                  as: "Results",
                  attributes: ["earnings"],
                  include: [
                    {
                      model: db.Schedule,
                      as: "Schedule",
                      attributes: ["name", "tStartDate", "tEndDate"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      where: {
        // Filters as expected
        // "$PoolsterPlayers.startDate$": {
        //   [Op.lte]: "2020-01-27",

        // Filters as expected
        // "$PoolsterPlayers.Player.Results.Schedule.tStartDate$": {
        //   [Op.lte]: "2020-01-27",

        // Error: Unhandled rejection SequelizeDatabaseError: Incorrect DATETIME value: '$PoolsterPlayers.Player.Results.Schedule.tStartDate$'
        "$PoolsterPlayers.startDate$": {
          [Op.lte]: "$PoolsterPlayers.Player.Results.Schedule.tStartDate$",

          // Error: Unhandled rejection SequelizeDatabaseError: Unknown column '$PoolsterPlayers->Player->Results->Schedule.tStartDate$' in 'where clause'
          // "$PoolsterPlayers.startDate$": {
          //   [Op.lte]: sequelize.col(
          //     "$PoolsterPlayers.Player.Results.Schedule.tStartDate$"
          //   ),

          // Error: Unhandled rejection SequelizeDatabaseError: Unknown column '$PoolsterPlayers->Player->Results->Schedule.tStartDate$' in 'where clause'
          // "$PoolsterPlayers.startDate$": {
          //   [Op.lte]: sequelize.fn(
          //     "date",
          //     sequelize.col(
          //       "$PoolsterPlayers.Player.Results.Schedule.tStartDate$"
          //     )
          //   ),

          // Error: Unhandled rejection SequelizeDatabaseError: Incorrect DATETIME value: 'Invalid date'
          // "$PoolsterPlayers.startDate$": {
          //   [Op.lte]: new Date(
          //     "$PoolsterPlayers.Player.Results.Schedule.tStartDate$"
          //   ),
        },
      },
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
          as: "Players",
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
  app.get("/api/temp4", function (req, res) {
    db.Poolster.findAll({
      attributes: ["handle"],
      include: [
        {
          model: db.Player,
          as: "Players",
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
      group: ["handle", "Poolster.poolsterId"],
      // raw: true,
    }).then((data) => {
      res.json(data);
    });
  });

  //not working
  app.get("/api/results", function (req, res) {
    db.Result.findAll({
      attributes: [
        "playerName",
        [sequelize.fn("sum", sequelize.col("earnings")), "total_earnings"],
      ],
      include: {
        model: db.Players,
        attributes: ["playerId", "tier"],
      },
      group: ["Results.playerName"],
      order: sequelize.literal("total_earnings DESC"),
    }).then((data) => {
      res.json(data);
    });
  });

  //demo of where clause from through table
  app.get("/api/temp5", function (req, res) {
    db.Poolster.findAll({
      attributes: ["handle"],
      include: [
        {
          model: db.Player,
          attributes: ["playerName", "tier"],
          through: {
            where: {
              startDate: {
                [Op.gte]: "2020-01-20",
              },
            },
          },
          include: [
            {
              model: db.Result,
              attributes: ["earnings"],
              include: [
                {
                  model: db.Schedule,
                  attributes: ["name", "tStartDate", "tEndDate"],
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

  //nest column syntax example
  app.get("/api/temp6", function (req, res) {
    db.Poolster.findAll({
      where: {
        poolsterId: 1,
        "$Players.Results.Schedule.tStartDate$": {
          [Op.gte]: "2020-02-18",
        },
      },
      attributes: ["handle"],
      include: [
        {
          model: db.Player,
          as: "Players",
          attributes: ["playerName", "tier"],
          include: [
            {
              model: db.Result,
              as: "Results",
              attributes: ["earnings"],
              include: [
                {
                  model: db.Schedule,
                  as: "Schedule",
                  attributes: ["name", "tStartDate", "tEndDate"],
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

  //backup (for start date test)
  app.get("/api/temp7", function (req, res) {
    db.Poolster.findAll({
      // through: {
      //   where: {
      //     startDate: {
      // [Op.lte]: sequelize.col("$Players.Results.Schedule.tStartDate$"),
      //     },
      //   },
      // },
      attributes: ["handle"],
      include: [
        {
          model: db.Player,
          as: "Players",
          attributes: ["playerName", "tier"],
          through: {
            where: {
              startDate: {
                [Op.lte]: "2020-01-27",
                // [Op.lte]: sequelize.col("$Results.Schedule.tStartDate$"),
              },
            },
          },
          include: [
            {
              model: db.Result,
              as: "Results",
              attributes: ["earnings"],
              include: [
                {
                  model: db.Schedule,
                  as: "Schedule",
                  attributes: ["name", "tStartDate", "tEndDate"],
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
};
