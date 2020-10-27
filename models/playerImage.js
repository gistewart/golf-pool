var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var PlayerImage = sequelize.define(
    "PlayerImage",
    {
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      playerImage: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );

  return PlayerImage;
};
