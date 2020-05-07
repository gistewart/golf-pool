require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var teams = [
  //playerID: 1
  {
    poolsterID: "1",
    playerID: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "2",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "3",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "4",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "5",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "1",
    playerID: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 2
  {
    poolsterID: "2",
    playerID: "7",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "8",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "5",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "2",
    playerID: "11",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 3
  {
    poolsterID: "3",
    playerID: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "12",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "13",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "14",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "15",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "3",
    playerID: "16",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 4
  {
    poolsterID: "4",
    playerID: "17",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "2",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "20",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "4",
    playerID: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 5
  {
    poolsterID: "5",
    playerID: "17",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "19",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "20",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "5",
    playerID: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 6
  {
    poolsterID: "6",
    playerID: "21",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "6",
    playerID: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "6",
    playerID: "19",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "6",
    playerID: "22",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "6",
    playerID: "23",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "6",
    playerID: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 7
  {
    poolsterID: "7",
    playerID: "24",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "7",
    playerID: "25",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "7",
    playerID: "26",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "7",
    playerID: "4",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "7",
    playerID: "23",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "7",
    playerID: "27",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 8
  {
    poolsterID: "8",
    playerID: "24",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "8",
    playerID: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "8",
    playerID: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "8",
    playerID: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "8",
    playerID: "5",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "8",
    playerID: "28",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 9
  {
    poolsterID: "9",
    playerID: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "9",
    playerID: "2",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "9",
    playerID: "29",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "9",
    playerID: "22",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "9",
    playerID: "23",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "9",
    playerID: "30",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerID: 10
  {
    poolsterID: "10",
    playerID: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "10",
    playerID: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "10",
    playerID: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "10",
    playerID: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "10",
    playerID: "20",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterID: "10",
    playerID: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
];

module.exports = function () {
  return db.Teams.bulkCreate(teams);
};
