var db = require("../models");

module.exports = function (sequelize, DataTypes) {
  var PoolsterPlayers = sequelize.define("PoolsterPlayers", {
    poolsterId: {
      type: DataTypes.INTEGER,
      references: {
        model: db.Poolster,
        key: "poolsterId",
      },
    },
    playerId: {
      type: DataTypes.INTEGER,
      references: {
        model: db.Player,
        key: "playerId",
      },
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: "2020-01-01",
    },
    endDate: {
      type: DataTypes.DATE,
      defaultValue: "2020-12-31",
    },
  });

  PoolsterPlayers.associate = function (models) {
    PoolsterPlayers.belongsTo(models.Poolster, {
      foreignKey: "poolsterId",
      sourceKey: "poolsterId",
    });
    PoolsterPlayers.belongsTo(models.Player, {
      foreignKey: "playerId",
      sourceKey: "playerId",
    });
  };

  return PoolsterPlayers;
};
