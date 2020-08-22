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
      percent: DataTypes.DECIMAL(5, 3),
      createdAt: DataTypes.DATEONLY,
      updatedAt: DataTypes.DATEONLY,
    },
    {
      timestamps: false,
    }
  );

  return livePurseSplit;
};
