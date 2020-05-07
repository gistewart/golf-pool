module.exports = function (sequelize, DataTypes) {
  var Schedule = sequelize.define("Schedule", {
    tournamentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    winner: DataTypes.STRING,
  });

  Schedule.associate = function (models) {
    Schedule.hasMany(models.Results, {
      foreignKey: "tournamentID",
      sourceKey: "tournamentID",
    });
  };

  return Schedule;
};
