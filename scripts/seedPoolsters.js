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
  {
    name: "Paul Odland",
    handle: "Banger",
  },
  {
    name: "Roger Silver",
    handle: "The Brit",
  },
  {
    name: "Ruben Possin",
    handle: "The Sage",
  },
  {
    name: "Russ Cottle",
    handle: "Scarlet Pimpernel",
  },
  {
    name: "Tony Hahn",
    handle: "Money Guru",
  },
  {
    name: "Vik Kabra",
    handle: "Jayhawk",
  },
  {
    name: "Wayne Bellows",
    handle: "El Caballito",
  },
];

module.exports = function () {
  return db.Poolster.bulkCreate(poolsters);
};
