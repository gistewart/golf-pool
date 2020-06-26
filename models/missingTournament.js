module.exports = function (sequelize, DataTypes) {
  var missingTournament = sequelize.define(
    "missingTournament",
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

  return missingTournament;
};
