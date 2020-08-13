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
      status: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  return liveEventSchedule;
};
