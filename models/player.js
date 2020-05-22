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
      as: "bar1",
      foreignKey: "playerId",
      otherKey: "poolsterId",
    });
    Player.hasMany(models.Result, {
      foreignKey: "playerName",
      sourceKey: "playerName",
    });
    Player.hasMany(models.PoolsterPlayers, {
      as: "bar2",
      foreignKey: "playerId",
      sourceKey: "playerId",
    });
    // Player.hasOne(models.PlayerImage, {
    //   foreignKey: {
    //     name: "playerName",
    //     allowNull: true,
    //   },
    // });
  };

  return Player;
};
