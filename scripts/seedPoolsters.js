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
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_35450.png",
  },
  {
    name: "Barton Cottle",
    handle: "The Bic",
  },
  {
    name: "Blake Cottle",
    handle: "The Snake",
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_33448.png",
  },
  {
    name: "Darrel Zander",
    handle: "The Chief",
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_33448.png",
  },
  {
    name: "Graeme Stewart",
    handle: "Braveheart",
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_36689.png",
  },
  {
    name: "James Holcomb",
    handle: "Southern Boy",
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_46970.png",
  },
  {
    name: "Jerry Yang",
    handle: "Treehugger",
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_46970.png",
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
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_33448.png",
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
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_23108.png",
  },
  {
    name: "Tony Hahn",
    handle: "Money Guru",
  },
  {
    name: "Vik Kabra",
    handle: "Jayhawk",
    image:
      "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_33448.png",
  },
  {
    name: "Wayne Bellows",
    handle: "El Caballito",
  },
];

module.exports = function () {
  return db.Poolster.bulkCreate(poolsters);
};
