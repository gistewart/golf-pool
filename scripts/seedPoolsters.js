require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var poolsters = [
  {
    name: "Alan Schneider",
    handle: "The Trader",
  },
  {
    name: "Ashley Marsay",
    handle: "Flash Ash",
  },
  {
    name: "Barton Cottle",
    handle: "The Bic",
  },
  {
    name: "Blake Cottle",
    handle: "The Snake",
  },
  {
    name: "Darrel Zander",
    handle: "The Chief",
  },
  {
    name: "Graeme Stewart",
    handle: "Braveheart",
  },
  {
    name: "James Holcomb",
    handle: "Southern Boy",
  },
  {
    name: "Jerry Yang",
    handle: "Treehugger",
  },
  {
    name: "John Reeves",
    handle: "The Canary",
  },
  {
    name: "Josh Zander",
    handle: "ZED",
  },
  {
    name: "Lynn Odland",
    handle: "Big Dog + JP",
  },
];

module.exports = function () {
  return db.Poolsters.bulkCreate(poolsters);
};
