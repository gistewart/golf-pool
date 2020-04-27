module.exports = function (sequelize, DataTypes) {
  var poolsters = sequelize.define("poolsters", {
    name: DataTypes.STRING,
    handle: DataTypes.STRING,
    email: DataTypes.STRING,
  });
  return poolsters;
};
