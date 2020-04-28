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
];

module.exports = function () {
  return db.Poolsters.bulkCreate(poolsters);
};
