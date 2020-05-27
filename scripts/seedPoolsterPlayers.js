require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var teams = [
  //poolsterId: 1
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
  //poolsterId: 2
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
  //poolsterId: 3
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
    endDate: "2020-03-04",
    type: "regular",
    effDate: "2020-03-04",
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
  {
    poolsterId: "3",
    playerId: "9",
    startDate: "2020-03-04",
    type: "regular",
    effDate: "2020-03-04",
  },
  //poolsterId: 4
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
  //poolsterId: 5
  {
    poolsterId: "5",
    playerId: "17",
  },
  {
    poolsterId: "5",
    playerId: "18",
    endDate: "2020-03-04",
    type: "regular",
    effDate: "2020-03-04",
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
  {
    poolsterId: "5",
    playerId: "12",
    startDate: "2020-03-04",
    type: "regular",
    effDate: "2020-03-04",
  },
  //poolsterId: 6
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
  //poolsterId: 7
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
  //poolsterId: 8
  {
    poolsterId: "8",
    playerId: "24",
  },
  {
    poolsterId: "8",
    playerId: "18",
    endDate: "2020-03-10",
    type: "regular",
    effDate: "2020-03-10",
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
  {
    poolsterId: "8",
    playerId: "44",
    startDate: "2020-03-10",
    type: "regular",
    effDate: "2020-03-10",
  },
  //poolsterId: 9
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
  //poolsterId: 10
  {
    poolsterId: "10",
    playerId: "1",
  },
  {
    poolsterId: "10",
    playerId: "18",
    endDate: "2020-03-10",
    type: "regular",
    effDate: "2020-03-10",
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
  {
    poolsterId: "10",
    playerId: "40",
    startDate: "2020-03-10",
    type: "regular",
    effDate: "2020-03-10",
  },
  //poolsterId: 11
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
  //poolsterId: 12
  {
    poolsterId: "12",
    playerId: "1",
  },
  {
    poolsterId: "12",
    playerId: "12",
  },
  {
    poolsterId: "12",
    playerId: "31",
  },
  {
    poolsterId: "12",
    playerId: "32",
  },
  {
    poolsterId: "12",
    playerId: "20",
  },
  {
    poolsterId: "12",
    playerId: "6",
  },
  //poolsterId: 13
  {
    poolsterId: "13",
    playerId: "1",
  },
  {
    poolsterId: "13",
    playerId: "18",
    endDate: "2020-03-04",
    type: "regular",
    effDate: "2020-03-10",
  },
  {
    poolsterId: "13",
    playerId: "33",
  },
  {
    poolsterId: "13",
    playerId: "34",
  },
  {
    poolsterId: "13",
    playerId: "23",
  },
  {
    poolsterId: "13",
    playerId: "35",
  },
  {
    poolsterId: "13",
    playerId: "12",
    startDate: "2020-03-04",
    type: "regular",
    effDate: "2020-03-10",
  },
  //poolsterId: 14
  {
    poolsterId: "14",
    playerId: "1",
  },
  {
    poolsterId: "14",
    playerId: "36",
  },
  {
    poolsterId: "14",
    playerId: "19",
  },
  {
    poolsterId: "14",
    playerId: "37",
  },
  {
    poolsterId: "14",
    playerId: "5",
  },
  {
    poolsterId: "14",
    playerId: "38",
  },
  //poolsterId: 15
  {
    poolsterId: "15",
    playerId: "39",
  },
  {
    poolsterId: "15",
    playerId: "2",
  },
  {
    poolsterId: "15",
    playerId: "19",
  },
  {
    poolsterId: "15",
    playerId: "22",
  },
  {
    poolsterId: "15",
    playerId: "15",
  },
  {
    poolsterId: "15",
    playerId: "16",
  },
  //poolsterId: 16
  {
    poolsterId: "16",
    playerId: "1",
  },
  {
    poolsterId: "16",
    playerId: "40",
  },
  {
    poolsterId: "16",
    playerId: "26",
  },
  {
    poolsterId: "16",
    playerId: "22",
  },
  {
    poolsterId: "16",
    playerId: "5",
  },
  {
    poolsterId: "16",
    playerId: "41",
  },
  //poolsterId: 17
  {
    poolsterId: "17",
    playerId: "17",
  },
  {
    poolsterId: "17",
    playerId: "40",
  },
  {
    poolsterId: "17",
    playerId: "9",
  },
  {
    poolsterId: "17",
    playerId: "22",
  },
  {
    poolsterId: "17",
    playerId: "42",
  },
  {
    poolsterId: "17",
    playerId: "11",
  },
  //poolsterId: 18
  {
    poolsterId: "18",
    playerId: "1",
  },
  {
    poolsterId: "18",
    playerId: "8",
  },
  {
    poolsterId: "18",
    playerId: "26",
  },
  {
    poolsterId: "18",
    playerId: "22",
  },
  {
    poolsterId: "18",
    playerId: "23",
  },
  {
    poolsterId: "18",
    playerId: "43",
  },
];

module.exports = function () {
  return db.PoolsterPlayers.bulkCreate(teams);
};
