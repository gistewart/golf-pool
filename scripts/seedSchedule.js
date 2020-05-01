require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var schedule = [
  {
    tournamentID: "401155413",
    name: "Sentry Tournament of Champions",
    startDate: "2020-01-02",
    endDate: "2020-01-05",
  },
  {
    tournamentID: "401155418",
    name: "Sony Open in Hawaii",
    startDate: "2020-01-09",
    endDate: "2020-01-12",
  },
  {
    tournamentID: "401155419",
    name: "The American Express",
    startDate: "2020-01-16",
    endDate: "2020-01-19",
  },
  {
    tournamentID: "401155420",
    name: "Farmers Insurance Open",
    startDate: "2020-01-23",
    endDate: "2020-01-26",
  },
  {
    tournamentID: "401155421",
    name: "Waste Management Phoenix Open",
    startDate: "2020-01-30",
    endDate: "2020-02-02",
  },
];

module.exports = function () {
  return db.Schedule.bulkCreate(schedule);
};
