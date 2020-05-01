require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var teams = [
  //playerID: 1
  {
    poolsterID: "1",
    playerID: "1",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "2",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "3",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "4",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "5",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "6",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  //playerID: 2
  {
    poolsterID: "2",
    playerID: "7",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "8",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "9",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "10",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "5",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "11",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  //playerID: 3
  {
    poolsterID: "3",
    playerID: "1",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "12",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "13",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "14",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "15",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "16",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  //playerID: 4
  {
    poolsterID: "4",
    playerID: "17",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "2",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "9",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "10",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "20",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "6",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  //playerID: 5
  {
    poolsterID: "5",
    playerID: "17",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "18",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "19",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "10",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "20",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "6",
    start_date: "2020-01-01",
    end_date: "2020-12-31",
  },
];

module.exports = function () {
  return db.Teams.bulkCreate(teams);
};
