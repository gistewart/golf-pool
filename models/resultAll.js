var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var ResultAll = sequelize.define(
    "ResultAll",
    {
      tournamentId: {
        type: DataTypes.INTEGER,
      },
      name: DataTypes.STRING,
      startDate: DataTypes.DATE,
      pos: DataTypes.STRING,
      playerNameX: {
        type: DataTypes.STRING,
      },
      toPar: DataTypes.STRING,
      earnings: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  );

  return ResultAll;
};
