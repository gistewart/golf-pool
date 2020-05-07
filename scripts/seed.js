const seedPoolsters = require("./seedPoolsters");
const seedPlayers = require("./seedPlayers");
const seedTeams = require("./seedTeams");
const seedSchedule = require("./seedSchedule");
const seedResults = require("./seedResults");

require("dotenv").config();
var db = require("../models");

db.sequelize
  .sync({ force: true })
  .then(function () {
    console.log("------------running seedPoolsters--------------");
    return seedPoolsters();
  })
  .then(function () {
    console.log("------------running seedPlayers--------------");
    return seedPlayers();
  })
  .then(function () {
    console.log("------------running seedTeams--------------");
    return seedTeams();
  })
  .then(function () {
    console.log("------------running seedSchedule--------------");
    return seedSchedule();
  })
  .then(function () {
    console.log("------------running seedResults----------------");
    return seedResults();
  });
// .then(function () {
//   db.sequelize.close();
// });
