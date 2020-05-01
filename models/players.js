module.exports = function (sequelize, DataTypes) {
  var Players = sequelize.define("Players", {
    playerID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    tier: DataTypes.INTEGER,
  });

  Players.associate = function (models) {
    Players.hasMany(models.Teams, {
      foreignKey: "playerID",
      sourceKey: "playerID",
    });
  };

  return Players;
};
