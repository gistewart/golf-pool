require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var teams = [
  //playerId: 1
  {
    poolsterId: "1",
    playerId: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "1",
    playerId: "2",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "1",
    playerId: "3",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "1",
    playerId: "4",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "1",
    playerId: "5",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "1",
    playerId: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 2
  {
    poolsterId: "2",
    playerId: "7",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "2",
    playerId: "8",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "2",
    playerId: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "2",
    playerId: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "2",
    playerId: "5",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "2",
    playerId: "11",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 3
  {
    poolsterId: "3",
    playerId: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "3",
    playerId: "12",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "3",
    playerId: "13",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "3",
    playerId: "14",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "3",
    playerId: "15",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "3",
    playerId: "16",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 4
  {
    poolsterId: "4",
    playerId: "17",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "4",
    playerId: "2",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "4",
    playerId: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "4",
    playerId: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "4",
    playerId: "20",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "4",
    playerId: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 5
  {
    poolsterId: "5",
    playerId: "17",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "5",
    playerId: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "5",
    playerId: "19",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "5",
    playerId: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "5",
    playerId: "20",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "5",
    playerId: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 6
  {
    poolsterId: "6",
    playerId: "21",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "6",
    playerId: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "6",
    playerId: "19",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "6",
    playerId: "22",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "6",
    playerId: "23",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "6",
    playerId: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 7
  {
    poolsterId: "7",
    playerId: "24",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "7",
    playerId: "25",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "7",
    playerId: "26",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "7",
    playerId: "4",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "7",
    playerId: "23",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "7",
    playerId: "27",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 8
  {
    poolsterId: "8",
    playerId: "24",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "8",
    playerId: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "8",
    playerId: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "8",
    playerId: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "8",
    playerId: "5",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "8",
    playerId: "28",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 9
  {
    poolsterId: "9",
    playerId: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "9",
    playerId: "2",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "9",
    playerId: "29",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "9",
    playerId: "22",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "9",
    playerId: "23",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "9",
    playerId: "30",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 10
  {
    poolsterId: "10",
    playerId: "1",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "10",
    playerId: "18",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "10",
    playerId: "9",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "10",
    playerId: "10",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "10",
    playerId: "20",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  {
    poolsterId: "10",
    playerId: "6",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
  },
  //playerId: 11
  {
    poolsterId: "11",
    playerId: "1",
  },
  {
    poolsterId: "11",
    playerId: "18",
  },
  {
    poolsterId: "11",
    playerId: "9",
  },
  {
    poolsterId: "11",
    playerId: "10",
  },
  {
    poolsterId: "11",
    playerId: "5",
  },
  {
    poolsterId: "11",
    playerId: "6",
  },
];

module.exports = function () {
  return db.PoolsterPlayers.bulkCreate(teams);
};
