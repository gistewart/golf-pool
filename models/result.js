module.exports = function (sequelize, DataTypes) {
  var Result = sequelize.define("Result", {
    tournamentId: {
      type: DataTypes.INTEGER,
    },
    pos: DataTypes.STRING,
    playerName: DataTypes.STRING,
    toPar: DataTypes.STRING,
    earnings: {
      type: DataTypes.INTEGER,
    },
  });

  Result.associate = function (models) {
    Result.belongsTo(models.Schedule, {
      foreignKey: "tournamentId",
      targetKey: "tournamentId",
    });
    Result.belongsTo(models.Player, {
      foreignKey: "playerName",
      targetKey: "playerName",
    });
  };
  return Result;
};
