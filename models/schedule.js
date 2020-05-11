module.exports = function (sequelize, DataTypes) {
  var Schedule = sequelize.define("Schedule", {
    tournamentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    winner: DataTypes.STRING,
  });

  Schedule.associate = function (models) {
    Schedule.hasMany(models.Result, {
      foreignKey: "tournamentId",
      sourceKey: "tournamentId",
    });
  };

  return Schedule;
};
