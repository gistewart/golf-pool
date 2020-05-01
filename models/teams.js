module.exports = function (sequelize, DataTypes) {
  var Teams = sequelize.define("Teams", {
    poolsterID: {
      type: DataTypes.INTEGER,
    },
    playerID: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  });

  Teams.associate = function (models) {
    Teams.belongsTo(models.Players, {
      foreignKey: "playerID",
      targetKey: "playerID",
    });
    Teams.belongsTo(models.Poolsters, {
      foreignKey: "poolsterID",
      targetKey: "poolsterID",
    });
  };

  return Teams;
};
