require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var teams = [
  {
    poolsterID: "1",
    player01: "1",
    player02: "2",
    player03: "3",
    player04: "4",
    player05: "5",
    player06: "6",
  },
  {
    poolsterID: "2",
    player01: "7",
    player02: "8",
    player03: "9",
    player04: "10",
    player05: "5",
    player06: "11",
  },
  {
    poolsterID: "3",
    player01: "1",
    player02: "12",
    player03: "13",
    player04: "14",
    player05: "15",
    player06: "16",
  },
  {
    poolsterID: "4",
    player01: "17",
    player02: "2",
    player03: "9",
    player04: "10",
    player05: "20",
    player06: "6",
  },
  {
    poolsterID: "5",
    player01: "17",
    player02: "18",
    player03: "19",
    player04: "10",
    player05: "20",
    player06: "6",
  },
];

module.exports = function () {
  return db.Teams.bulkCreate(teams);
};
