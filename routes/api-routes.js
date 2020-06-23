var db = require("../models");
var sequelize = require("sequelize");
const { Op } = require("sequelize");
const seedPoolsters = require("../scripts/seedPoolsters");
const seedPlayers = require("../scripts/seedPlayers");
const seedTeams = require("../scripts/seedPoolsterPlayers");
const seedSchedule = require("../scripts/seedSchedule");
const seedResults = require("../scripts/seedResults");
const seedScheduleStage = require("../scripts/seedScheduleStage");
require("dotenv").config();

module.exports = function (app) {
  app.get("/api/poolsters", function (req, res) {
    db.Poolster.findAll({}).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/allEvents", async function (req, res) {
    await db.Poolster.findAll({
      attributes: ["poolsterId", "name", "handle", "image"],
      include: [
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          attributes: [
            "startDate",
            "endDate",
            "reStartDate",
            "reEndDate",
            "effDate",
            "type",
          ],
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
            image: data[i].image,
            Players: [],
          });
          a = data[i].PoolsterPlayers;
          for (let j = 0; j < a.length; j++) {
            result[i].Players.push({
              name: a[j].Player.playerName,
              startDate: a[j].startDate,
              endDate: a[j].endDate,
              reStartDate: a[j].reStartDate,
              reEndDate: a[j].reEndDate,
              effDate: a[j].effDate,
              type: a[j].type,
              tier: a[j].Player.tier,
              Tournaments: [],
            });
            b = a[j].Player.Results;
            for (let k = 0; k < b.length; k++) {
              c = b[k].Schedule;
              if (
                (a[j].startDate < c.tStartDate &&
                  a[j].endDate > c.tStartDate) ||
                (a[j].reStartDate < c.tStartDate &&
                  a[j].reEndDate > c.tStartDate)
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
    const date = await db.Schedule.max("tStartDate", {
      where: {
        winner: {
          [Op.regexp]: "^[A-Z]",
        },
        tournamentID: {
          [Op.gte]: "401155413",
        },
      },
    })
      .then(function (date) {
        return db.Poolster.findAll({
          attributes: ["poolsterId", "name", "handle", "image"],
          where: {
            "$PoolsterPlayers.Player.Results.earnings$": {
              [Op.gte]: 0,
            },
          },
          include: [
            {
              model: db.PoolsterPlayers,
              as: "PoolsterPlayers",
              attributes: [
                "startDate",
                "endDate",
                "reStartDate",
                "reEndDate",
                "effDate",
                "type",
              ],
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
                      where: {
                        earnings: {
                          [Op.gte]: 0,
                        },
                      },
                      include: [
                        {
                          model: db.Schedule,
                          as: "Schedule",
                          where: {
                            tStartDate: {
                              [Op.eq]: date,
                            },
                          },
                          attributes: ["name", "tDate", "tStartDate"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });
      })
      .then(function (data) {
        let a, b, c;
        let result = [];
        for (let i = 0; i < data.length; i++) {
          result.push({
            name: data[i].name,
            handle: data[i].handle,
            image: data[i].image,
            Players: [],
          });
          a = data[i].PoolsterPlayers;
          let jAdj = 0;
          for (let j = 0; j < a.length; j++) {
            if (
              (a[j].endDate > a[j].Player.Results[0].Schedule.tStartDate &&
                a[j].startDate < a[j].Player.Results[0].Schedule.tStartDate) ||
              (a[j].reEndDate > a[j].Player.Results[0].Schedule.tStartDate &&
                a[j].reStartDate < a[j].Player.Results[0].Schedule.tStartDate)
            ) {
              result[i].Players.push({
                name: a[j].Player.playerName,
                startDate: a[j].startDate,
                endDate: a[j].endDate,
                reStartDate: a[j].reStartDate,
                reEndDate: a[j].reEndDate,
                tier: a[j].Player.tier,
                Tournaments: [],
              });

              b = a[j].Player.Results;
              for (let k = 0; k < b.length; k++) {
                c = b[k].Schedule;
                result[i].Players[j + jAdj].Tournaments.push({
                  name: c.name,
                  date: c.tDate,
                  start: c.tStartDate,
                  position: b[k].pos,
                  toPar: b[k].toPar,
                  earnings: b[k].earnings,
                });
              }
            } else {
              jAdj += -1;
            }
          }
        }
        return result;
      })
      .then((result) => {
        res.json(result);
      });
  });

  app.get("/api/allExclLastEvent", async function (req, res) {
    const date = await db.Schedule.max("tStartDate", {
      where: {
        winner: {
          [Op.regexp]: "^[A-Z]",
        },
        tournamentID: {
          [Op.gte]: "401155413",
        },
      },
    })
      .then(function (date) {
        return db.Poolster.findAll({
          attributes: ["poolsterId", "name", "handle"],
          include: [
            {
              model: db.PoolsterPlayers,
              as: "PoolsterPlayers",
              attributes: [
                "startDate",
                "endDate",
                "reStartDate",
                "reEndDate",
                "effDate",
                "type",
              ],
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
                          where: {
                            tStartDate: {
                              [Op.ne]: date,
                            },
                          },
                          attributes: ["name", "tDate", "tStartDate"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });
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
              reStartDate: a[j].reStartDate,
              reEndDate: a[j].reEndDate,
              effDate: a[j].effDate,
              type: a[j].type,
              tier: a[j].Player.tier,
              Tournaments: [],
            });
            b = a[j].Player.Results;
            for (let k = 0; k < b.length; k++) {
              c = b[k].Schedule;
              if (
                (a[j].startDate < c.tStartDate &&
                  a[j].endDate > c.tStartDate) ||
                (a[j].reStartDate < c.tStartDate &&
                  a[j].reEndDate > c.tStartDate)
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

  app.get("/api/lastEventDetails", async function (req, res) {
    const date = await db.Schedule.max("tStartDate", {
      where: {
        winner: {
          [Op.regexp]: "^[A-Z]",
        },
        tournamentID: {
          [Op.gte]: "401155413",
          // [Op.lte]: "401155425",
        },
      },
    })
      .then(function (date) {
        return db.Schedule.findAll({
          attributes: ["name", "tDate", "tStartDate", "winner"],
          where: {
            tStartDate: {
              [Op.eq]: date,
            },
            winner: {
              [Op.regexp]: "^[A-Z]",
            },
          },
        });
      })
      .then((result) => {
        res.json(result);
      });
  });

  app.get("/api/appMaxDate", async function (req, res) {
    let date = await db.Schedule.max("tStartDate", {
      where: {
        winner: {
          [Op.regexp]: "^[A-Z]",
        },
        tournamentID: {
          [Op.gte]: "401155413",
        },
      },
    }).then((result) => {
      res.json(result);
    });
  });

  app.get("/api/webMaxDate", async function (req, res) {
    // await db.ScheduleStage.sync({ force: true }).then(function () {
    //   return seedScheduleStage();
    // });

    let date = db.ScheduleStage.max("tStartDate", {
      where: {
        winner: {
          [Op.regexp]: "^[A-Z]",
        },
        tournamentID: {
          [Op.gte]: "401155413",
        },
      },
    }).then((result) => {
      res.json(result);
    });
  });

  app.get("/api/dbRefresh", async function (req, res) {
    await db.sequelize
      .sync({ force: true })
      .then(function () {
        console.log("-------running seedPoolsters-----------");
        return seedPoolsters();
      })
      .then(function () {
        console.log("------------running seedPlayers--------------");
        return seedPlayers();
      })
      .then(function () {
        console.log("---------running seedTeams-----------");
        return seedTeams();
      })
      .then(function () {
        console.log("---------running seedSchedule---------");
        return seedSchedule();
      })
      .then(function (res) {
        console.log("---------running seedResults----------");
        return seedResults();
      })
      // .then(async function () {
      //   const temp = await db.sequelize.close();
      //   return;
      // })
      .then((result) => {
        res.json(result);
      });
    console.log("finished dbRefresh");
  });

  app.get("/api/posts", function (req, res) {
    db.Post.findAll({}).then(function (dbPost) {
      res.json(dbPost);
    });
  });

  app.post("/api/posts", function (req, res) {
    db.Post.create(req.body).then(function (dbPost) {
      res.json(dbPost);
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

  //substitutions by poolster
  app.get("/api/subs", function (req, res) {
    db.PoolsterPlayers.findAll({
      attributes: [
        "poolsterId",
        [sequelize.fn("count", sequelize.col("playerId")), "player_count"],
      ],
      where: {
        effDate: {
          [Op.lte]: "2020-12-01",
        },
      },
      group: ["poolsterId"],
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
