var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var livePosition = sequelize.define("livePosition", {
    tournamentId: DataTypes.INTEGER,
    pos: DataTypes.STRING,
    posAdj: DataTypes.STRING,
    playerName: DataTypes.STRING,
    toPar: DataTypes.STRING,
    toParAdj: DataTypes.INTEGER,
    today: DataTypes.STRING,
    thru: DataTypes.STRING,
  });

  return livePosition;
};
