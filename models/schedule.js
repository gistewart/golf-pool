module.exports = function (sequelize, DataTypes) {
  var Schedule = sequelize.define(
    "Schedule",
    {
      tournamentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      tStartDate: DataTypes.DATE,
      tEndDate: DataTypes.DATE,
      name: DataTypes.STRING,
      winner: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );

  Schedule.associate = function (models) {
    Schedule.hasMany(models.Result, {
      foreignKey: "tournamentId",
      sourceKey: "tournamentId",
    });
  };

  return Schedule;
};
