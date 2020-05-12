var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var Player = sequelize.define("Player", {
    playerId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    playerName: {
      type: DataTypes.STRING,
      unique: true,
    },
    tier: DataTypes.INTEGER,
  });

  Player.associate = function (models) {
    Player.belongsToMany(models.Poolster, {
      through: models.PoolsterPlayers,
      foreignKey: "playerId",
      otherKey: "poolsterId",
    });
    Player.hasMany(models.Result, {
      foreignKey: "playerName",
      sourceKey: "playerName",
    });
  };

  return Player;
};
