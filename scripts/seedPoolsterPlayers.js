require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var teams = [
  //playerId: 1
  {
    poolsterId: "1",
    playerId: "1",
  },
  {
    poolsterId: "1",
    playerId: "2",
  },
  {
    poolsterId: "1",
    playerId: "3",
  },
  {
    poolsterId: "1",
    playerId: "4",
  },
  {
    poolsterId: "1",
    playerId: "5",
  },
  {
    poolsterId: "1",
    playerId: "6",
  },
  //playerId: 2
  {
    poolsterId: "2",
    playerId: "7",
  },
  {
    poolsterId: "2",
    playerId: "8",
  },
  {
    poolsterId: "2",
    playerId: "9",
  },
  {
    poolsterId: "2",
    playerId: "10",
  },
  {
    poolsterId: "2",
    playerId: "5",
  },
  {
    poolsterId: "2",
    playerId: "11",
  },
  //playerId: 3
  {
    poolsterId: "3",
    playerId: "1",
  },
  {
    poolsterId: "3",
    playerId: "12",
  },
  {
    poolsterId: "3",
    playerId: "13",
  },
  {
    poolsterId: "3",
    playerId: "14",
  },
  {
    poolsterId: "3",
    playerId: "15",
  },
  {
    poolsterId: "3",
    playerId: "16",
  },
  //playerId: 4
  {
    poolsterId: "4",
    playerId: "17",
  },
  {
    poolsterId: "4",
    playerId: "2",
  },
  {
    poolsterId: "4",
    playerId: "9",
  },
  {
    poolsterId: "4",
    playerId: "10",
  },
  {
    poolsterId: "4",
    playerId: "20",
  },
  {
    poolsterId: "4",
    playerId: "6",
  },
  //playerId: 5
  {
    poolsterId: "5",
    playerId: "17",
  },
  {
    poolsterId: "5",
    playerId: "18",
  },
  {
    poolsterId: "5",
    playerId: "19",
  },
  {
    poolsterId: "5",
    playerId: "10",
  },
  {
    poolsterId: "5",
    playerId: "20",
  },
  {
    poolsterId: "5",
    playerId: "6",
  },
  //playerId: 6
  {
    poolsterId: "6",
    playerId: "21",
  },
  {
    poolsterId: "6",
    playerId: "18",
  },
  {
    poolsterId: "6",
    playerId: "19",
  },
  {
    poolsterId: "6",
    playerId: "22",
  },
  {
    poolsterId: "6",
    playerId: "23",
  },
  {
    poolsterId: "6",
    playerId: "6",
  },
  //playerId: 7
  {
    poolsterId: "7",
    playerId: "24",
  },
  {
    poolsterId: "7",
    playerId: "25",
  },
  {
    poolsterId: "7",
    playerId: "26",
  },
  {
    poolsterId: "7",
    playerId: "4",
  },
  {
    poolsterId: "7",
    playerId: "23",
  },
  {
    poolsterId: "7",
    playerId: "27",
  },
  //playerId: 8
  {
    poolsterId: "8",
    playerId: "24",
  },
  {
    poolsterId: "8",
    playerId: "18",
  },
  {
    poolsterId: "8",
    playerId: "9",
  },
  {
    poolsterId: "8",
    playerId: "10",
  },
  {
    poolsterId: "8",
    playerId: "5",
  },
  {
    poolsterId: "8",
    playerId: "28",
  },
  //playerId: 9
  {
    poolsterId: "9",
    playerId: "1",
  },
  {
    poolsterId: "9",
    playerId: "2",
  },
  {
    poolsterId: "9",
    playerId: "29",
  },
  {
    poolsterId: "9",
    playerId: "22",
  },
  {
    poolsterId: "9",
    playerId: "23",
  },
  {
    poolsterId: "9",
    playerId: "30",
  },
  //playerId: 10
  {
    poolsterId: "10",
    playerId: "1",
  },
  {
    poolsterId: "10",
    playerId: "18",
  },
  {
    poolsterId: "10",
    playerId: "9",
  },
  {
    poolsterId: "10",
    playerId: "10",
  },
  {
    poolsterId: "10",
    playerId: "20",
  },
  {
    poolsterId: "10",
    playerId: "6",
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
