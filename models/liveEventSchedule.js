module.exports = function (sequelize, DataTypes) {
  var liveEventSchedule = sequelize.define(
    "liveEventSchedule",
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
      purse: DataTypes.INTEGER,
    },
    {
      timestamps: false,
    }
  );
  return liveEventSchedule;
};
