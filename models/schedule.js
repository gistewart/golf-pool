module.exports = function (sequelize, DataTypes) {
  var Schedule = sequelize.define("Schedule", {
    tournamentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  });
  return Schedule;
};
