var db = require("../models");
var sequelize = require("sequelize");
const { Op } = require("sequelize");
const seedScheduleStage = require("../scripts/seedScheduleStage");
const seedLiveEventSchedule = require("../scripts/seedLiveEventSchedule");
const runLivePositions = require("../scripts/runLivePositions");
const runResults = require("../scripts/runResults");
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

  app.get("/api/livePlayers", async function (req, res) {
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
              tier: a[j].Player.tier,
              Tournaments: [],
            });
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

  app.get("/api/appSchedule", async function (req, res) {
    db.Schedule.findAll({}).then((result) => {
      res.json(result);
    });
  });

  app.get("/api/webSchedule", async function (req, res) {
    // NEW TEMPORARY CODE (SWAP)
    // Testing Start
    await db.ScheduleStage.findAll({})
      // Testing End
      // Production Start
      // await db.ScheduleStage.sync({ force: true })
      //   .then(async function () {
      //     const temp = await seedScheduleStage();
      //   })
      //   .then(function () {
      //     return db.ScheduleStage.findAll({});
      //   })
      //Production End
      .then((result) => {
        res.json(result);
      });
  });

  app.post("/api/submitTournament", async function (req, res) {
    console.log("------req.body-------:", req.body);
    await db.Schedule.bulkCreate(req.body).then(function (data) {
      res.json(data);
    });
  });

  app.get("/api/resultsPosted", async function (req, res) {
    await db.Result.findAll({
      attributes: ["tournamentId"],
      group: ["tournamentId"],
    }).then(function (result) {
      res.json(result);
    });
  });

  app.post("/api/missingResults", async function (req, res) {
    console.log("------req.body-------:", req.body);
    await db.missingTournament.sync({ force: true });
    await db.missingTournament
      .bulkCreate(req.body)
      .then(async function () {
        const temp = await runResults();
      })
      .then(function (data) {
        res.json(data);
      });
  });

  app.get("/api/poolsters", function (req, res) {
    db.Poolster.findAll({}).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/playerRankings", async function (req, res) {
    await db.Poolster.findAll({
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
        let arr = [];
        for (let i = 0; i < result.length; i++) {
          arr.push({
            name: result[i].name,
            handle: result[i].handle,
            tier: [],
          });
          let sum1 = 0,
            sum2 = 0,
            sum3 = 0,
            sum4 = 0,
            sum5 = 0,
            sum6 = 0;
          for (let j = 0; j < result[i].Players.length; j++) {
            for (let k = 0; k < result[i].Players[j].Tournaments.length; k++) {
              switch (result[i].Players[j].tier) {
                case 1:
                  sum1 += result[i].Players[j].Tournaments[k].earnings;
                  break;
                case 2:
                  sum2 += result[i].Players[j].Tournaments[k].earnings;
                  break;
                case 3:
                  sum3 += result[i].Players[j].Tournaments[k].earnings;
                  break;
                case 4:
                  sum4 += result[i].Players[j].Tournaments[k].earnings;
                  break;
                case 5:
                  sum5 += result[i].Players[j].Tournaments[k].earnings;
                  break;
                case 6:
                  sum6 += result[i].Players[j].Tournaments[k].earnings;
                  break;
              }
            }
          }
          arr[i].tier.push({
            number: 1,
            sum: sum1,
          });
          arr[i].tier.push({
            number: 2,
            sum: sum2,
          });
          arr[i].tier.push({
            number: 3,
            sum: sum3,
          });
          arr[i].tier.push({
            number: 4,
            sum: sum4,
          });
          arr[i].tier.push({
            number: 5,
            sum: sum5,
          });
          arr[i].tier.push({
            number: 6,
            sum: sum6,
          });
        }

        let len = arr.length;
        let averages = [];

        for (let m = 0; m < 6; m++) {
          const avg = arr.reduce((a, b) => a + b.tier[m].sum, 0) / len;
          averages.push({
            number: m + 1,
            avg: avg,
          });
        }

        for (let i = 0; i < arr.length; i++) {
          let grade = "";
          for (let j = 0; j < averages.length; j++) {
            let percent = arr[i].tier[j].sum / averages[j].avg;
            if (percent < 0.5) {
              grade = "E";
            } else if (percent < 0.75) {
              grade = "D";
            } else if (percent < 1.25) {
              grade = "C";
            } else if (percent < 1.5) {
              grade = "B";
            } else {
              grade = "A";
            }
            arr[i].tier[j]["average"] = averages[j].avg;
            arr[i].tier[j]["grade"] = grade;
            arr[i].tier[j]["gradePercent"] = percent;
          }
        }

        return arr;
      })
      .then((arr) => {
        res.json(arr);
      });
  });

  app.get("/api/livePositions", async function (req, res) {
    // Testing Start
    await db.livePosition
      .findAll({})
      // Test End
      // Production Start
      // await db.liveEventSchedule
      //   .sync({ force: true })
      //   .then(async function () {
      //     const temp = await seedLiveEventSchedule();
      //   })
      //   .then(async function () {
      //     await db.livePosition.sync({ force: true });
      //     const temp = await runLivePositions();
      //   })
      //   .then(async function () {
      //     return db.livePosition.findAll({});
      //   })
      // Production End
      .then((result) => {
        res.json(result);
      });
  });

  app.get("/api/livePurseSplit", function (req, res) {
    db.livePurseSplit.findAll({}).then(function (result) {
      res.json(result);
    });
  });

  app.get("/api/liveSchedule", function (req, res) {
    db.liveEventSchedule.findAll({}).then(function (result) {
      res.json(result);
    });
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
