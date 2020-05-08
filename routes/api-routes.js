var db = require("../models");
var sequelize = require("sequelize");

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
      attributes: [
        "playerName",
        [sequelize.fn("sum", sequelize.col("earnings")), "total_earnings"],
      ],
      group: ["playerName"],
    }).then((data) => {
      res.json(data);
    });
  });
};
