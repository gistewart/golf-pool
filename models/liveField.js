var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var liveField = sequelize.define(
    "liveField",
    {
      name: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );

  return liveField;
};
