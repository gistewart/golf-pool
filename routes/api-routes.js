var db = require("../models");

//Get Earnings
module.exports = function (app) {
  app.get("/api/poolsters", function (req, res) {
    db.poolsters.findAll({}).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/schedule", function (req, res) {
    db.Schedule.findAll({}).then((data) => {
      res.json(data);
    });
  });

  app.get("/api/results", function (req, res) {
    db.Results.findAll({
      group: playerName,
    }).then((data) => {
      res.json(data);
    });
  });
};
