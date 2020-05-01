module.exports = function (sequelize, DataTypes) {
  var Schedule = sequelize.define("Schedule", {
    tournamentID: {
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  });

  // Schedule.associate = function (models) {
  //   Schedule.hasMany(models.Results, {
  //     foreignKey: "TournamentID",
  //     sourceKey: "TournamentID",
  //   });
  // };

  return Schedule;
};
