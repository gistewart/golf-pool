var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var liveResult = sequelize.define("liveResult", {
    tournamentId: {
      type: DataTypes.INTEGER,
    },
    pos: DataTypes.STRING,
    posAdj: DataTypes.STRING,
    playerName: {
      type: DataTypes.STRING,
    },
    toPar: DataTypes.STRING,
  });

  return liveResult;
};
