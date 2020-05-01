module.exports = function (sequelize, DataTypes) {
  var Results = sequelize.define("Results", {
    tournamentID: {
      type: DataTypes.INTEGER,
    },
    pos: DataTypes.STRING,
    name: DataTypes.STRING,
    toPar: DataTypes.STRING,
    earnings: DataTypes.STRING,
  });

  Results.associate = function (models) {
    Results.belongsTo(models.Schedule, {
      foreignKey: "tournamentID",
      targetKey: "tournamentID",
    });
  };
  return Results;
};
