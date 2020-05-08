module.exports = function (sequelize, DataTypes) {
  var Teams = sequelize.define("Teams", {
    poolsterID: {
      type: DataTypes.INTEGER,
    },
    playerID: DataTypes.INTEGER,
    startDate: {
      type: DataTypes.DATE,
      defaultValue: "2020-01-01",
    },
    endDate: {
      type: DataTypes.DATE,
      defaultValue: "2020-12-31",
    },
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
