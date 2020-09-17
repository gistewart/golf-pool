var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var liveField = sequelize.define(
    "liveField",
    {
      tournamentId: DataTypes.INTEGER,
      playerName: DataTypes.STRING,
      teeTime: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );

  return liveField;
};
