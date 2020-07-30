module.exports = function (sequelize, DataTypes) {
  var ScheduleShortName = sequelize.define(
    "ScheduleShortName",
    {
      tournamentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      shortName: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );

  return ScheduleShortName;
};
