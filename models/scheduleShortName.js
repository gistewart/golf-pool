module.exports = function (sequelize, DataTypes) {
  var ScheduleShortName = sequelize.define(
    "ScheduleShortName",
    {
      name: DataTypes.STRING,
      shortName: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );

  return ScheduleShortName;
};
