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

  app.get("/api/dataset", function (req, res) {
    db.Poolster.findAll({
      attributes: ["poolsterId", "name", "handle"],
      include: [
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          attributes: ["startDate", "endDate"],
          include: [
            {
              model: db.Player,
              as: "Player",
              attributes: ["playerName", "tier"],
              include: [
                {
                  model: db.Result,
                  as: "Results",
                  attributes: ["earnings", "toPar", "pos"],
                  include: [
                    {
                      model: db.Schedule,
                      as: "Schedule",
                      attributes: ["name", "tDate", "tStartDate", "tEndDate"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
      .then(function (data) {
        let a, b, c;
        let result = [];
        for (let i = 0; i < data.length; i++) {
          result.push({
            name: data[i].name,
            handle: data[i].handle,
            Players: [],
          });
          a = data[i].PoolsterPlayers;
          for (let j = 0; j < a.length; j++) {
            result[i].Players.push({
              name: a[j].Player.playerName,
              startDate: a[j].startDate,
              endDate: a[j].endDate,
              tier: a[j].Player.tier,
              Tournaments: [],
            });
            b = a[j].Player.Results;
            for (let k = 0; k < b.length; k++) {
              c = b[k].Schedule;
              if (
                a[j].startDate < c.tStartDate &&
                a[j].endDate > c.tStartDate
              ) {
                result[i].Players[j].Tournaments.push({
                  name: c.name,
                  date: c.tDate,
                  start: c.tStartDate,
                  position: b[k].pos,
                  toPar: b[k].toPar,
                  earnings: b[k].earnings,
                });
              }
            }
          }
        }
        return result;
      })
      .then((result) => {
        res.json(result);
      });
  });

  app.get("/api/lastEvent", async function (req, res) {
    const result = await db.Schedule.max("tEndDate", {
      where: {
        winner: {
          [Op.regexp]: "^[A-Z]",
        },
        tournamentID: {
          [Op.gte]: "401155413",
        },
      },
    })

      // where: {
      //   winner: {
      //     [Op.regexp]: "^[A-Z]",
      //   },
      // },
      //   attributes: [sequelize.fn("min", sequelize.col("tEndDate")), "testDate"],
      // })
      // .then(function (maxDate) {
      //   return db.Poolster.findAll({
      //     attributes: ["poolsterId", "name", "handle"],
      //     include: [
      //       {
      //         model: db.PoolsterPlayers,
      //         as: "PoolsterPlayers",
      //         attributes: ["startDate", "endDate"],
      //         include: [
      //           {
      //             model: db.Player,
      //             as: "Player",
      //             attributes: ["playerName", "tier"],
      //             include: [
      //               {
      //                 model: db.Result,
      //                 as: "Results",
      //                 attributes: ["earnings", "toPar", "pos"],
      //                 include: [
      //                   {
      //                     model: db.Schedule,
      //                     as: "Schedule",
      //                     // where: {
      //                     //   tEndDate: {
      //                     //     [Op.in]: maxDate,
      //                     //   },
      //                     // },
      //                     attributes: [
      //                       "name",
      //                       "tDate",
      //                       "tStartDate",
      //                       "tEndDate",
      //                     ],
      //                   },
      //                 ],
      //               },
      //             ],
      //           },
      //         ],
      //       },
      //     ],
      //   });
      // })
      // .then(function (data) {
      //   let a, b, c;
      //   let result = [];
      //   for (let i = 0; i < data.length; i++) {
      //     result.push({
      //       name: data[i].name,
      //       handle: data[i].handle,
      //       Players: [],
      //     });
      //     a = data[i].PoolsterPlayers;
      //     for (let j = 0; j < a.length; j++) {
      //       result[i].Players.push({
      //         name: a[j].Player.playerName,
      //         startDate: a[j].startDate,
      //         endDate: a[j].endDate,
      //         tier: a[j].Player.tier,
      //         Tournaments: [],
      //       });
      //       b = a[j].Player.Results;
      //       for (let k = 0; k < b.length; k++) {
      //         c = b[k].Schedule;
      //         if (
      //           a[j].startDate < c.tStartDate &&
      //           a[j].endDate > c.tStartDate
      //         ) {
      //           result[i].Players[j].Tournaments.push({
      //             name: c.name,
      //             date: c.tDate,
      //             start: c.tStartDate,
      //             position: b[k].pos,
      //             toPar: b[k].toPar,
      //             earnings: b[k].earnings,
      //           });
      //         }
      //       }
      //     }
      //   }
      //   return result;
      // })
      .then((result) => {
        res.json(result);
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
