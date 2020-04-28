const seedPoolsters = require("./seedPoolsters");

require("dotenv").config();
var db = require("../models");

db.sequelize
  .sync({ force: true })
  .then(function () {
    return seedPoolsters();
  })
  .then(function () {
    db.sequelize.close();
  });

// Run this file on heroku deployment
// heroku-postbuild in package.json
