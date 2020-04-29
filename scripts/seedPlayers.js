require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var players = [
  {
    name: "Rory McIlory",
    tier: "1",
  },
  {
    name: "Tiger Woods",
    tier: "2",
  },
  {
    name: "Jason Kokrak",
    tier: "3",
  },
  {
    name: "Cameron Champ",
    tier: "4",
  },
  {
    name: "Joaquin Niemann",
    tier: "5",
  },
  {
    name: "Viktor Hovland",
    tier: "6",
  },
  {
    name: "Patrick Cantlay",
    tier: "1",
  },
  {
    name: "Hideki Matsuyama",
    tier: "2",
  },
  {
    name: "Sungjae Im",
    tier: "3",
  },
  {
    name: "Collin Morikawa",
    tier: "4",
  },
  {
    name: "Scottie Scheffler",
    tier: "6",
  },
  {
    name: "Tommy Fleetwood",
    tier: "2",
  },
  {
    name: "C.T. Pan",
    tier: "3",
  },
  {
    name: "Keegan Bradley",
    tier: "4",
  },
  {
    name: "Cameron Smith",
    tier: "5",
  },
  {
    name: "Matt Jones",
    tier: "6",
  },
  {
    name: "Justin Thomas",
    tier: "1",
  },
  {
    name: "Justin Rose",
    tier: "2",
  },
  {
    name: "Abraham Ancer",
    tier: "3",
  },
  {
    name: "Matthew Wolff",
    tier: "5",
  },
];

module.exports = function () {
  return db.Players.bulkCreate(players);
};
