const seedPoolsters = require("./seedPoolsters");
const seedPlayers = require("./seedPlayers");
const seedPlayerImages = require("./seedPlayerImages");
const seedTeams = require("./seedPoolsterPlayers");
const seedSchedule = require("./seedSchedule");
const seedResults = require("./seedResults");
const seedScheduleStage = require("./seedScheduleStage");

require("dotenv").config();
var db = require("../models");

// module.exports = function () {

db.sequelize
  .sync({})
  // db.sequelize
  //   .sync({ force: true })
  //   .then(function () {
  //     console.log("----------running seedPoolsters--------------");
  //     return seedPoolsters();
  //   })
  //   .then(function () {
  //     console.log("------------running seedPlayers--------------");
  //     return seedPlayers();
  //   })
  //   .then(function () {
  //     console.log("------------running seedTeams--------------");
  //     return seedTeams();
  //   })
  //   .then(function () {
  //     console.log("------------running seedSchedule------------");
  //     return seedSchedule();
  //   })
  //   .then(function (res) {
  //     console.log("------------running seedResults-------------");
  //     return seedResults();
  //   })
  .then(function (res) {
    console.log("------------running seedScheduleStage-------------");
    return seedScheduleStage();
  });
// .then(async function () {
//   const temp = await db.sequelize.close();
//   return;
// });
