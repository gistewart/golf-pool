module.exports = function (sequelize, DataTypes) {
  var PoolsterImage = sequelize.define(
    "PoolsterImage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      handle: DataTypes.STRING,
      name: DataTypes.STRING,
      image: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );

  return PoolsterImage;
};
