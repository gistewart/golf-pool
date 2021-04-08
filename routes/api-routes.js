var db = require("../models");
var sequelize = require("sequelize");
const { Op } = require("sequelize");
const seedScheduleStage = require("../scripts/seedScheduleStage");
const seedLiveEventSchedule = require("../scripts/seedLiveEventSchedule");
const runLivePositions = require("../scripts/runLivePositions");
const runResults = require("../scripts/runResults");
const runTCHandicap = require("../scripts/runTCHandicap");
const seedResultsAll = require("../scripts/seedResultsAll");
const seedScheduleOther = require("../scripts/seedScheduleOther");
const seedResultsPGA = require("../scripts/seedResultsPGA");
const e = require("express");
require("dotenv").config();
const { QueryTypes } = require("sequelize");
const runField = require("../scripts/runField");
var moment = require("moment");

module.exports = function (app) {
  const today = moment().format();
  const Year = moment(today).year();
  // const today = moment("2020-02-28");
  // const Year = 2020;

  app.get("/api/poolsters", function (req, res) {
    db.Poolster.findAll({
      where: {
        StartDate: {
          [Op.lte]: today,
        },
        EndDate: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.gte]: today,
          },
        },
      },
    }).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/allEvents", async function (req, res) {
    await db.Poolster.findAll({
      where: {
        StartDate: {
          [Op.lte]: today,
        },
        EndDate: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.gte]: today,
          },
        },
      },
      attributes: ["poolsterId", "name", "handle"],
      include: [
        {
          model: db.PoolsterImage,
          attributes: ["image"],
        },
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          where: sequelize.where(
            sequelize.fn("YEAR", sequelize.col("PoolsterPlayers.startDate")),
            Year
          ),
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
              attributes: ["playerName"],
              include: [
                {
                  model: db.PlayerTier,
                  attributes: ["tier"],
                  where: {
                    year: {
                      [Op.eq]: Year,
                    },
                  },
                },
                {
                  model: db.Result,
                  as: "Results",
                  attributes: ["earnings", "toPar", "pos"],
                  include: [
                    {
                      model: db.Schedule,
                      as: "Schedule",
                      attributes: ["name", "tDate", "tStartDate", "tEndDate"],
                      where: sequelize.where(
                        sequelize.fn("YEAR", sequelize.col("tStartDate")),
                        Year
                      ),
                      include: [
                        {
                          model: db.ScheduleShortName,
                          attributes: ["shortName"],
                        },
                      ],
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
            image: data[i].PoolsterImage.image,
            Players: [],
          });

          a = data[i].PoolsterPlayers;
          for (let j = 0; j < a.length; j++) {
            result[i].Players.push({
              name: a[j].Player.playerName,
              startDate: moment(a[j].startDate),
              endDate: moment(a[j].endDate),
              reStartDate: moment(a[j].reStartDate),
              reEndDate: moment(a[j].reEndDate),
              effDate: moment(a[j].effDate),
              type: a[j].type,
              tier: a[j].Player.PlayerTiers[0].tier,
              Tournaments: [],
            });

            b = a[j].Player.Results;
            //kAdj for shortName purposes
            let kAdj = 0;
            for (let k = 0; k < b.length; k++) {
              c = b[k].Schedule;
              let tStart = moment(c.tStartDate);
              if (
                !(
                  (result[i].Players[j].startDate < tStart &&
                    result[i].Players[j].endDate > tStart) ||
                  (result[i].Players[j].reStartDate < tStart &&
                    result[i].Players[j].reEndDate > tStart)
                )
              )
                kAdj++;
              else {
                result[i].Players[j].Tournaments.push({
                  name: c.name,
                  shortName: c.name,
                  date: c.tDate,
                  start: moment(c.tStartDate),
                  position: b[k].pos,
                  toPar: b[k].toPar,
                  earnings: b[k].earnings,
                });
                if (c.ScheduleShortName) {
                  result[i].Players[j].Tournaments[k - kAdj].shortName =
                    c.ScheduleShortName.shortName;
                }
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
    // filter for max start date AND year of tStartDate = current year
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
          where: {
            StartDate: {
              [Op.lte]: today,
            },
            EndDate: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.gte]: today,
              },
            },
          },
          attributes: ["poolsterId", "name", "handle"],
          where: {
            "$PoolsterPlayers.Player.Results.earnings$": {
              [Op.gte]: 0,
            },
          },
          include: [
            {
              model: db.PoolsterImage,
              attributes: ["image"],
            },
            {
              model: db.PoolsterPlayers,
              as: "PoolsterPlayers",
              where: sequelize.where(
                sequelize.fn(
                  "YEAR",
                  sequelize.col("PoolsterPlayers.startDate")
                ),
                Year
              ),
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
                  attributes: ["playerName"],
                  include: [
                    {
                      model: db.PlayerTier,
                      attributes: ["tier"],
                      where: {
                        year: {
                          [Op.eq]: Year,
                        },
                      },
                    },
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
                          include: [
                            {
                              model: db.ScheduleShortName,
                              attributes: ["shortName"],
                            },
                          ],
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
            image: data[i].PoolsterImage.image,
            Players: [],
          });

          a = data[i].PoolsterPlayers;
          // jAdj accounts for inactive players when building Tournaments array for each player
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
                tier: a[j].Player.PlayerTiers[0].tier,
                Tournaments: [],
              });

              b = a[j].Player.Results;
              for (let k = 0; k < b.length; k++) {
                c = b[k].Schedule;
                result[i].Players[j + jAdj].Tournaments.push({
                  name: c.name,
                  shortName: c.name,
                  date: c.tDate,
                  start: c.tStartDate,
                  position: b[k].pos,
                  toPar: b[k].toPar,
                  earnings: b[k].earnings,
                });

                if (result[i].Players && c.ScheduleShortName) {
                  result[i].Players[j + jAdj].Tournaments[k].shortName =
                    c.ScheduleShortName.shortName;
                }
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

  // filter for max start date AND current year's events
  app.get("/api/allExclLastEvent", async function (req, res) {
    console.log("Year: ", Year);
    let date = await db.Schedule.max("tStartDate", {
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
        console.log("date: ", date);
        return db.Poolster.findAll({
          where: {
            StartDate: {
              [Op.lte]: today,
            },
            EndDate: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.gte]: today,
              },
            },
          },
          attributes: ["poolsterId", "name", "handle"],
          include: [
            {
              model: db.PoolsterPlayers,
              as: "PoolsterPlayers",
              where: sequelize.where(
                sequelize.fn(
                  "YEAR",
                  sequelize.col("PoolsterPlayers.startDate")
                ),
                Year
              ),
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
                  attributes: ["playerName"],
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
                            [Op.and]: [
                              sequelize.where(
                                sequelize.fn(
                                  "YEAR",
                                  sequelize.col("tStartDate")
                                ),
                                Year
                              ),
                              {
                                tStartDate: {
                                  [Op.ne]: date,
                                },
                              },
                            ],
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

  app.get("/api/thisYearsEvents", async function (req, res) {
    db.Schedule.findAll({
      attributes: ["name", "tDate", "tStartDate", "winner"],
      where: sequelize.where(
        sequelize.fn("YEAR", sequelize.col("tStartDate")),
        Year
      ),
    }).then((result) => {
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
        // to seed all unfiltered results set for the tournament
        // seedResultsAll();
      })
      .then(function (data) {
        res.json(data);
      });
  });

  // GET route used for testing only
  app.get("/api/missingResults", async function (req, res) {
    const temp = await runResults().then(function (data) {
      res.json(data);
    });
  });

  // player tier testing route
  app.get("/api/testDates", async function (req, res) {
    db.PlayerTier.findAll({
      where: {
        year: {
          [Op.eq]: Year,
        },
      },
    }).then((data) => {
      res.json(data);
    });
  });

  // api to determine if Live Scoring tab should be shown (gets ESPN tournament id, date, name, purse, status)
  app.get("/api/liveTourneyStatus", async function (req, res) {
    let type = "";
    // Production Start
    await db.liveEventSchedule.sync({ force: true });
    await db.liveFieldSchedule.sync({ force: true }).then(async function () {
      const temp = await seedLiveEventSchedule();
      type = seedLiveEventSchedule.liveSeedType;
      console.log("------type------", type);
      return;
    });
    // Production End
    if (type === "field") {
      await db.liveFieldSchedule.findAll({}).then((result) => {
        res.json(result);
      });
    } else {
      await db.liveEventSchedule.findAll({}).then((result) => {
        res.json(result);
      });
    }
  });

  // gets livePositions by first seeding liveEventSchedule, then running runLivePositions
  app.get("/api/livePositions", async function (req, res) {
    // Testing Start
    // await db.livePosition
    //   .findAll({})
    // Test End
    // Production Start
    await db.livePosition.sync({ force: true });
    const temp = await runLivePositions()
      // })
      .then(async function () {
        return db.livePosition.findAll({});
      })
      // Production End
      .then((result) => {
        res.json(result);
      });
  });

  app.get("/api/livePositionsFreeze", async function (req, res) {
    await db.livePosition.findAll({}).then((result) => {
      res.json(result);
    });
  });

  // filters liveEventSchedule for event with largest purse
  app.get("/api/livePurseSplit", async function (req, res) {
    // get name of tournament from liveEventSchedule
    await db.liveEventSchedule
      .findAll({
        attributes: ["name", "purse"],
        order: [["purse", "desc"]],
      })

      // get tType of tournament identified above
      .then(function (name) {
        return db.liveTourneyType.findAll({
          attributes: ["tType"],
          where: {
            tName: {
              [Op.eq]: name[0].name,
            },
          },
        });
      })

      // get purse info for this tType
      .then(function (tType) {
        // for tournaments not included on liveTourneyTypes db table, we default to a regular tType
        if (tType.length === 0) {
          tType = [{ tType: "reg" }];
        }
        return db.livePurseSplit.findAll({
          where: {
            class: {
              [Op.eq]: tType[0].tType,
            },
          },
        });
      })

      .then(function (result) {
        res.json(result);
      });
  });

  app.get("/api/liveMCLine", async function (req, res) {
    // get name of tournament from liveEventSchedule
    await db.liveEventSchedule
      .findAll({
        attributes: ["name"],
        order: [["purse", "desc"]],
      })

      // get MCLine of tournament identified above
      .then(function (name) {
        return db.liveTourneyType.findAll({
          attributes: ["tMCLine", "tTenShotRule"],
          where: {
            tName: {
              [Op.eq]: name[0].name,
            },
          },
        });
      })

      .then(function (result) {
        // for tournaments not included on liveTourneyTypes db table, we default to the regular cut line of 65
        if (result.length === 0) {
          result = [{ tMCLine: "65" }];
        }
        res.json(result);
      });
  });

  app.get("/api/liveSchedule", async function (req, res) {
    await db.liveEventSchedule
      .findAll({
        order: [["purse", "desc"]],
      })
      .then(function (result) {
        res.json(result);
      });
  });

  // poolsters and all their player demographics, in a formatted array
  app.get("/api/livePlayers", async function (req, res) {
    await db.Poolster.findAll({
      where: {
        StartDate: {
          [Op.lte]: today,
        },
        EndDate: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.gte]: today,
          },
        },
      },
      attributes: ["poolsterId", "name", "handle"],
      include: [
        {
          model: db.PoolsterImage,
          attributes: ["image"],
        },
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          where: sequelize.where(
            sequelize.fn("YEAR", sequelize.col("PoolsterPlayers.startDate")),
            Year
          ),
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
              attributes: ["playerName"],
              include: [
                {
                  model: db.PlayerTier,
                  attributes: ["tier"],
                  where: {
                    year: {
                      [Op.eq]: Year,
                    },
                  },
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
            id: data[i].poolsterId,
            name: data[i].name,
            poolster: data[i].handle,
            image: data[i].PoolsterImage.image,
            Players: [],
          });
          a = data[i].PoolsterPlayers;

          for (let j = 0; j < a.length; j++) {
            result[i].Players.push({
              player: a[j].Player.playerName,
              startDate: a[j].startDate,
              endDate: a[j].endDate,
              reStartDate: a[j].reStartDate,
              reEndDate: a[j].reEndDate,
              effDate: a[j].effDate,
              type: a[j].type,
              tier: a[j].Player.PlayerTiers[0].tier,
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

  // provides poolsters total earnings for the year and base ranking (used for both Field and Live views)
  app.get("/api/liveAllEvents", async function (req, res) {
    await db.Poolster.findAll({
      where: {
        StartDate: {
          [Op.lte]: today,
        },
        EndDate: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.gte]: today,
          },
        },
      },
      attributes: ["poolsterId", "name", "handle"],
      include: [
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          where: sequelize.where(
            sequelize.fn("YEAR", sequelize.col("PoolsterPlayers.startDate")),
            Year
          ),
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
                      attributes: ["name", "tDate", "tStartDate", "tEndDate"],
                      where: sequelize.where(
                        sequelize.fn("YEAR", sequelize.col("tStartDate")),
                        Year
                      ),
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
            id: data[i].poolsterId,
            name: data[i].name,
            handle: data[i].handle,
            poolsterEarnings: 0,
            ranking: 0,
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
                  earnings: b[k].earnings,
                });
              }
            }
          }
        }
        for (let i = 0; i < result.length; i++) {
          let poolsterSum = 0;
          for (let j = 0; j < result[i].Players.length; j++) {
            for (let k = 0; k < result[i].Players[j].Tournaments.length; k++) {
              poolsterSum += result[i].Players[j].Tournaments[k].earnings;
            }
          }
          result[i]["poolsterEarnings"] = poolsterSum;
        }
        result = result.sort((a, b) =>
          a.poolsterEarnings < b.poolsterEarnings ? 1 : -1
        );

        for (let i = 0; i < result.length; i++) {
          result[i].ranking = i + 1;
          delete result[i].Players;
        }

        return result;
      })
      .then((result) => {
        res.json(result);
      });
  });

  // new api call - run (via localhost... in browser) on day 1 of TC when toPar and Today values are good (it seeds TCHandicaps db table)
  app.get("/api/liveTCHandicapSeed", async function (req, res) {
    await db.liveTCHandicap.sync({ force: true });
    await runTCHandicap().then(function (data) {
      res.json(data);
    });
  });

  // to grab final TC results
  app.get("/api/tcTable", function (req, res) {
    db.ResultTC.findAll({}).then((data) => {
      res.json(data);
    });
  });

  // to grab handicaps for each player for app.js
  app.get("/api/liveTCHandicap", function (req, res) {
    db.liveTCHandicap.findAll({}).then((data) => {
      res.json(data);
    });
  });

  // to seed silly season events in late Dec / early Jan; run via localhost
  app.get("/api/seedScheduleOther", async function (req, res) {
    await db.ScheduleOther.sync({ force: true });
    await seedScheduleOther();
    await db.ScheduleOther.findAll({}).then(function (result) {
      res.json(result);
    });
  });

  // seeds all results using db.ScheduleOther table; run via localhost
  app.get("/api/seedResultsAll", async function (req, res) {
    await seedResultsAll();
    await db.ResultAll.findAll({}).then(function (result) {
      res.json(result);
    });
  });

  // for seeding of full tournament results if not reported by ESPN; see comments in seedResultsPGA() first; run via localhost
  app.get("/api/seedResultsPGA", async function (req, res) {
    const temp = await seedResultsPGA().then(function (data) {
      res.json(data);
    });
  });

  // to populate db with data for next year's player categories (local host run only)
  app.get("/api/playerCategories", async function (req, res) {
    db.ResultAll.findAll({
      attributes: [
        "playerNameX",
        "name",
        "tournamentId",
        "earnings",
        // [sequelize.fn("sum", sequelize.col("earnings")), "totalEarnings"],
      ],
      where: {
        tournamentID: {
          [Op.notBetween]: [401219793, 401219800],
          [Op.ne]: 401219480,
        },
      },
    })
      .then(async function (data) {
        let result = [];
        let match = false;
        for (let i = 0; i < data.length; i++) {
          let a = data[i].playerNameX;
          match = false;
          for (let j = 0; j < result.length; j++) {
            if (a == result[j].name) {
              result[j].earnings += data[i].earnings;
              match = true;
              break;
            }
          }
          if (!match) {
            result.push({
              name: data[i].playerNameX,
              earnings: data[i].earnings,
            });
          }
        }

        result = result.sort((a, b) =>
          Number(a.earnings) < Number(b.earnings) ? 1 : -1
        );

        for (let i = 0; i < result.length; i++) {
          result[i].rank = i + 1;
        }
        // await db.playerCategory.sync({ force: true });
        // await db.playerCategory.bulkCreate(result);
        return result;
      })

      .then((data) => {
        res.json(data);
      });
  });

  // to grab db with data for next year's player categories
  app.get("/api/grabPlayerCategories", async function (req, res) {
    db.playerCategory
      .findAll({
        where: {
          rank: {
            [Op.lte]: 100,
          },
        },
      })
      .then((data) => {
        res.json(data);
      });
  });

  // populates and returns Field data (player, tee-time) for upcoming tournament
  app.get("/api/liveField", async function (req, res) {
    // Prod start
    await db.liveField.sync({ force: true }).then(async function () {
      const temp = await runField();
      return;
    });
    // Prod end ok

    await db.liveField.findAll({}).then(function (result) {
      res.json(result);
    });
  });

  // poolsters, their active players, w/ tee time, tier, image, all finishes since Jan 2020 (Sep 2019 for local version)
  app.get("/api/fieldData", async function (req, res) {
    await db.Poolster.findAll({
      where: {
        StartDate: {
          [Op.lte]: today,
        },
        EndDate: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.gte]: today,
          },
        },
      },
      attributes: ["poolsterId", "name", "handle"],
      include: [
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          where: sequelize.where(
            sequelize.fn("YEAR", sequelize.col("PoolsterPlayers.startDate")),
            Year
          ),
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
              attributes: ["playerName"],
              include: [
                {
                  model: db.PlayerTier,
                  attributes: ["tier"],
                  where: {
                    year: {
                      [Op.eq]: Year,
                    },
                  },
                },
                {
                  model: db.liveField,
                  attributes: ["teeTime", "tournamentId"],
                },
                { model: db.PlayerImage, attributes: ["playerImage"] },
                {
                  model: db.ResultAll,
                  attributes: ["name", "startDate", "pos"],
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
          let jAdj = 0;
          for (let j = 0; j < a.length; j++) {
            if (!a[j].Player.PlayerImage) {
              console.log("--------no image-------");
              a[j].Player.PlayerImage = {
                playerImage:
                  "https://res.cloudinary.com/pga-tour/image/upload/c_fill,g_face:center,h_294,q_auto,w_220/headshots_default.png",
              };
            }

            if (
              (moment(a[j].startDate).isSameOrBefore(today) &&
                moment(a[j].endDate).isAfter(today)) ||
              (moment(a[j].reStartDate).isSameOrBefore(today) &&
                moment(a[j].reEndDate).isAfter(today))
            ) {
              result[i].Players.push({
                name: a[j].Player.playerName,
                startDate: a[j].startDate,
                endDate: a[j].endDate,
                reStartDate: a[j].reStartDate,
                reEndDate: a[j].reEndDate,
                tier: a[j].Player.PlayerTiers[0].tier,
                image: a[j].Player.PlayerImage.playerImage,
                Results: [],
              });

              result[i].Players[j - jAdj].teeTime = a[j].Player.liveField
                ? a[j].Player.liveField.teeTime
                : 0;
              result[i].Players[j - jAdj].tournamentId = a[j].Player.liveField
                ? a[j].Player.liveField.tournamentId
                : 0;

              b = a[j].Player.ResultAlls;
              for (let k = 0; k < b.length; k++) {
                result[i].Players[j - jAdj].Results.push({
                  name: b[k].name,
                  startDate: b[k].startDate,
                  pos: b[k].pos,
                });
              }
            } else {
              jAdj++;
            }
          }
        }
        return result;
      })
      .then((result) => {
        res.json(result);
      });
  });

  //poolsterProfileImage - run on pageLoad
  app.get("/api/poolsterProfileImage", async function (req, res) {
    await db.Poolster.findAll({
      where: {
        StartDate: {
          [Op.lte]: today,
        },
        EndDate: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.gte]: today,
          },
        },
      },
      attributes: ["poolsterId", "handle"],
      include: [
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          where: sequelize.where(
            sequelize.fn("YEAR", sequelize.col("PoolsterPlayers.startDate")),
            Year
          ),
          attributes: ["startDate", "endDate", "reStartDate", "reEndDate"],
          include: [
            {
              model: db.Player,
              as: "Player",
              attributes: ["playerName"],
              include: [
                {
                  model: db.PlayerTier,
                  attributes: ["tier"],
                  where: {
                    year: {
                      [Op.eq]: Year,
                    },
                  },
                },
                { model: db.PlayerImage, attributes: ["playerImage"] },
              ],
            },
          ],
        },
      ],
    })
      .then(async function (data) {
        let a;
        let personalHeadshot = [
          {
            id: "1",
            image:
              "https://cache.legacy.net/legacy/images/cobrands/SFGate/photos/S0165580_1_20200717.jpgx?w=712&h=600&option=1",
          },
          { id: "5", image: "/images/chief.jpeg" },
          { id: "6", image: "/images/Braveheart.jpeg" },
          { id: "12", image: "/images/banger.jpeg" },
          { id: "17", image: "/images/jayhawk.jpeg" },
        ];

        let result = [];
        for (let i = 0; i < data.length; i++) {
          result.push({
            id: data[i].poolsterId,
            handle: data[i].handle,
          });
          a = data[i].PoolsterPlayers;
          for (let j = 0; j < a.length; j++) {
            if (!a[j].Player.PlayerImage) {
              console.log("--------no image-------");
              a[j].Player.PlayerImage = {
                playerImage:
                  "https://res.cloudinary.com/pga-tour/image/upload/c_fill,g_face:center,h_294,q_auto,w_220/headshots_default.png",
              };
            }

            if (
              a[j].Player.PlayerTiers[0].tier === 1 &&
              ((moment(a[j].startDate).isSameOrBefore(today) &&
                moment(a[j].endDate).isSameOrAfter(moment().startOf("day"))) ||
                (moment(a[j].reStartDate).isSameOrBefore(today) &&
                  moment(a[j].reEndDate).isSameOrAfter(
                    moment().startOf("day")
                  )))
            ) {
              result[i].name = a[j].Player.playerName;
              result[i].image = a[j].Player.PlayerImage.playerImage;
            }
          }
        }
        for (let i = 0; i < result.length; i++) {
          for (let j = 0; j < personalHeadshot.length; j++) {
            if (result[i].id == personalHeadshot[j].id) {
              result[i].image = personalHeadshot[j].image;
              break;
            }
          }
        }
        await db.PoolsterImage.sync({ force: true });
        await db.PoolsterImage.bulkCreate(result);
        return result;
      })
      .then((result) => {
        res.json(result);
      });
  });

  app.get("/api/playerRatings", async function (req, res) {
    await db.Poolster.findAll({
      where: {
        StartDate: {
          [Op.lte]: today,
        },
        EndDate: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.gte]: today,
          },
        },
      },
      attributes: ["poolsterId", "name", "handle"],
      include: [
        {
          model: db.PoolsterPlayers,
          as: "PoolsterPlayers",
          where: sequelize.where(
            sequelize.fn("YEAR", sequelize.col("PoolsterPlayers.startDate")),
            Year
          ),
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
              attributes: ["playerName"],
              include: [
                {
                  model: db.PlayerTier,
                  attributes: ["tier"],
                  where: {
                    year: {
                      [Op.eq]: Year,
                    },
                  },
                },
                {
                  model: db.Result,
                  as: "Results",
                  attributes: ["earnings", "toPar", "pos"],
                  include: [
                    {
                      model: db.Schedule,
                      as: "Schedule",
                      attributes: ["name", "tDate", "tStartDate", "tEndDate"],
                      where: sequelize.where(
                        sequelize.fn("YEAR", sequelize.col("tStartDate")),
                        Year
                      ),
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
              tier: a[j].Player.PlayerTiers[0].tier,
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
            if (arr[i].tier[j].sum == 0 && averages[j].avg == 0) {
              grade = "C";
            } else if (percent < 0.5) {
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

            if (arr[i].tier[j].sum == 0 && averages[j].avg == 0) {
              arr[i].tier[j]["gradePercent"] = 1;
            }
          }
        }
        return arr;
      })
      .then((arr) => {
        res.json(arr);
      });
  });

  // playerImage testing route
  app.get("/api/playerImage", async function (req, res) {
    db.PlayerImage.findAll({}).then((data) => {
      res.json(data);
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

  // to grab db with data for next year's player categories
  app.get("/html/api/grabTCPurseSplit", async function (req, res) {
    db.livePurseSplit
      .findAll({
        where: {
          class: {
            [Op.eq]: "tc",
          },
        },
        attributes: ["pos", "percent"],
      })
      .then((data) => {
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

  //substitutions by poolster - not used
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
          attributes: ["playerName"],
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
          attributes: ["playerName"],
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
