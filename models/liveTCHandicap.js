var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var liveTCHandicap = sequelize.define("liveTCHandicap", {
    tournamentId: DataTypes.INTEGER,
    playerName: DataTypes.STRING,
    pos: DataTypes.STRING,
    toPar: DataTypes.INTEGER,
    today: DataTypes.INTEGER,
    handicap: DataTypes.INTEGER,
  });

  return liveTCHandicap;
};
