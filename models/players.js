module.exports = function (sequelize, DataTypes) {
  var Players = sequelize.define("Players", {
    playerID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    playerName: {
      type: DataTypes.STRING,
      unique: true,
    },
    tier: DataTypes.INTEGER,
  });

  Players.associate = function (models) {
    Players.hasMany(models.Teams, {
      foreignKey: "playerID",
      sourceKey: "playerID",
    });
    Players.hasMany(models.Results, {
      foreignKey: "playerName",
      sourceKey: "playerName",
    });
  };

  return Players;
};
