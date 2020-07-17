var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var liveResult = sequelize.define("liveResult", {
    tournamentId: DataTypes.INTEGER,
    pos: DataTypes.STRING,
    posAdj: DataTypes.STRING,
    playerName: DataTypes.STRING,
    toPar: DataTypes.STRING,
    thru: DataTypes.STRING,
  });

  return liveResult;
};
