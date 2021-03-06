module.exports = function (sequelize, DataTypes) {
  var liveTourneyType = sequelize.define(
    "liveTourneyType",
    {
      tType: DataTypes.STRING,
      tName: DataTypes.STRING,
      tMCLine: DataTypes.STRING,
      tTenShotRule: DataTypes.BOOLEAN,
    },
    {
      timestamps: false,
    }
  );
  return liveTourneyType;
};
