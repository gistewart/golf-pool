var db = require(".");

module.exports = function (sequelize, DataTypes) {
  var liveResult = sequelize.define("liveResult", {
    tournamentId: {
      type: DataTypes.INTEGER,
    },
    pos: DataTypes.STRING,
    playerName: {
      type: DataTypes.STRING,
      // check if reference necessary
      references: {
        model: db.Player,
        key: "playerName",
      },
    },
    toPar: DataTypes.STRING,
  });

  liveResult.associate = function (models) {
    liveResult.belongsTo(models.Player, {
      foreignKey: "playerName",
      targetKey: "playerName",
    });
  };
  return liveResult;
};
