var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var ResultTC = sequelize.define("ResultTC", {
    tournamentId: DataTypes.INTEGER,
    playerName: DataTypes.STRING,
    pos: DataTypes.STRING,
    toPar: DataTypes.STRING,
    toParAdj: DataTypes.INTEGER,
    posTC: DataTypes.INTEGER,
    posTCDisplay: DataTypes.STRING,
    toParTC: DataTypes.INTEGER,
    toParTCDisplay: DataTypes.STRING,
    tot: DataTypes.INTEGER,
    earnings: DataTypes.INTEGER,
    handicap: DataTypes.INTEGER,
  });

  return ResultTC;
};
