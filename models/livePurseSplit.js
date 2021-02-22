var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var livePurseSplit = sequelize.define(
    "livePurseSplit",
    {
      class: {
        type: DataTypes.STRING,
        defaultValue: "reg",
      },
      pos: DataTypes.STRING,
      percent: DataTypes.DECIMAL(7, 6),
    },
    {
      timestamps: false,
    }
  );

  return livePurseSplit;
};
