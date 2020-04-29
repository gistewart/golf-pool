module.exports = function (sequelize, DataTypes) {
  var Teams = sequelize.define("Teams", {
    poolsterID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    player01: DataTypes.INTEGER,
    player02: DataTypes.INTEGER,
    player03: DataTypes.INTEGER,
    player04: DataTypes.INTEGER,
    player05: DataTypes.INTEGER,
    player06: DataTypes.INTEGER,
  });
  return Teams;
};
