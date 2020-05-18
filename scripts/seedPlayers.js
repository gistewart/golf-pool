require("dotenv").config();
var fetch = require("node-fetch");
var db = require("../models");

var players = [
  {
    playerName: "Rory McIlroy",
    tier: "1",
  },
  {
    playerName: "Tiger Woods",
    tier: "2",
  },
  {
    playerName: "Jason Kokrak",
    tier: "3",
  },
  {
    playerName: "Cameron Champ",
    tier: "4",
  },
  {
    playerName: "Joaquin Niemann",
    tier: "5",
  },
  {
    playerName: "Viktor Hovland",
    tier: "6",
  },
  {
    playerName: "Patrick Cantlay",
    tier: "1",
  },
  {
    playerName: "Hideki Matsuyama",
    tier: "2",
  },
  {
    playerName: "Sungjae Im",
    tier: "3",
  },
  {
    playerName: "Collin Morikawa",
    tier: "4",
  },
  {
    playerName: "Scottie Scheffler",
    tier: "6",
  },
  {
    playerName: "Tommy Fleetwood",
    tier: "2",
  },
  {
    playerName: "C.T. Pan",
    tier: "3",
  },
  {
    playerName: "Keegan Bradley",
    tier: "4",
  },
  {
    playerName: "Cameron Smith",
    tier: "5",
  },
  {
    playerName: "Matt Jones",
    tier: "6",
  },
  {
    playerName: "Justin Thomas",
    tier: "1",
  },
  {
    playerName: "Justin Rose",
    tier: "2",
  },
  {
    playerName: "Abraham Ancer",
    tier: "3",
  },
  {
    playerName: "Matthew Wolff",
    tier: "5",
  },
  {
    playerName: "Brooks Koepka",
    tier: "1",
  },
  {
    playerName: "Jordan Spieth",
    tier: "4",
  },
  {
    playerName: "Henrik Stenson",
    tier: "5",
  },
  {
    playerName: "Jon Rahm",
    tier: "1",
  },
  {
    playerName: "Shane Lowry",
    tier: "2",
  },
  {
    playerName: "Jason Day",
    tier: "3",
  },
  {
    playerName: "Matt Wallace",
    tier: "6",
  },
  {
    playerName: "Maverick McNealy",
    tier: "6",
  },
  {
    playerName: "Phil Mickelson",
    tier: "3",
  },
  {
    playerName: "Brendon Todd",
    tier: "6",
  },
  {
    playerName: "Corey Conners",
    tier: "3",
  },
  {
    playerName: "Max Homa",
    tier: "4",
  },
  {
    playerName: "Louis Oosthuizen",
    tier: "3",
  },
  {
    playerName: "Sergio Garcia",
    tier: "4",
  },
  {
    playerName: "Martin Kaymer",
    tier: "6",
  },
  {
    playerName: "Adam Scott",
    tier: "2",
  },
  {
    playerName: "Joel Dahmen",
    tier: "4",
  },
  {
    playerName: "Sebastian Munoz",
    tier: "6",
  },
  {
    playerName: "Matt Kuchar",
    tier: "1",
  },
  {
    playerName: "Rickie Fowler",
    tier: "2",
  },
  {
    playerName: "Charl Schwartzel",
    tier: "6",
  },
  {
    playerName: "Danny Willett",
    tier: "5",
  },
  {
    playerName: "Seung-Yul Noh",
    tier: "6",
  },
];

module.exports = function () {
  return db.Player.bulkCreate(players);
};
