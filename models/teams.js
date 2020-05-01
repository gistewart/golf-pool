module.exports = function (sequelize, DataTypes) {
  var Teams = sequelize.define("Teams", {
    poolsterID: {
      type: DataTypes.INTEGER,
    },
    playerID: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
  });
  return Teams;
};
