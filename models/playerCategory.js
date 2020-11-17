var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var playerCategory = sequelize.define(
    "playerCategory",
    {
      rank: DataTypes.INTEGER,
      name: DataTypes.STRING,
      earnings: DataTypes.INTEGER,
    },
    {
      timestamps: false,
    }
  );

  return playerCategory;
};
