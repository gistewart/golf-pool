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
  return Players;
};
