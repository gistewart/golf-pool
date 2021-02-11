var db = require("../models");

module.exports = function (sequelize, DataTypes) {
  var PoolsterPlayers = sequelize.define(
    "PoolsterPlayers",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      poolsterId: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: db.Poolster,
        //   key: "poolsterId",
        // },
      },
      playerId: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: db.Player,
        //   key: "playerId",
        // },
      },
      startDate: {
        type: DataTypes.DATEONLY,
        defaultValue: "2021-01-01",
      },
      endDate: {
        type: DataTypes.DATEONLY,
        defaultValue: "2021-12-31",
      },
      reStartDate: {
        type: DataTypes.DATEONLY,
      },
      reEndDate: {
        type: DataTypes.DATEONLY,
        defaultValue: "2021-12-31",
      },
      effDate: {
        type: DataTypes.DATEONLY,
      },
      type: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );

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
