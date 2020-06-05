module.exports = function (sequelize, DataTypes) {
  var ScheduleStage = sequelize.define(
    "ScheduleStage",
    {
      tournamentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      tDate: DataTypes.STRING,
      tStartDate: DataTypes.DATEONLY,
      tEndDate: DataTypes.DATEONLY,
      name: DataTypes.STRING,
      winner: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  return ScheduleStage;
};
