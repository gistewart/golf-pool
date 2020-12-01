var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var PlayerTier = sequelize.define(
    "PlayerTier",
    {
      playerName: {
        type: DataTypes.STRING,
      },
      playerId: {
        type: DataTypes.INTEGER,
      },
      year: {
        type: DataTypes.STRING,
      },
      tier: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  );

  return PlayerTier;
};
