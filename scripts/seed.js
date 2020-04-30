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
    return seedPoolsters();
  })
  .then(function () {
    return seedPlayers();
  })
  .then(function () {
    return seedTeams();
  })
  .then(function () {
    return seedSchedule();
  })
  .then(function () {
    return seedResults();
    // })
    // .then(function () {
    //   db.sequelize.close();
  });

// Run this file on heroku deployment
// heroku-postbuild in package.json
