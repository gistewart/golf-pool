module.exports = function (sequelize, DataTypes) {
  var Poolsters = sequelize.define("Poolsters", {
    poolsterID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    handle: DataTypes.STRING,
  });
  return Poolsters;
};
