module.exports = function (sequelize, DataTypes) {
  var Poolster = sequelize.define("Poolster", {
    poolsterId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    handle: DataTypes.STRING,
  });

  Poolster.associate = function (models) {
    Poolster.belongsToMany(models.Player, {
      through: "PoolsterPlayers",
      foreignKey: "poolsterId",
      otherKey: "playerId",
    });
  };

  return Poolster;
};
