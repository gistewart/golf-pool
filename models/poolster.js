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
      through: models.PoolsterPlayers,
      as: "foo1",
      foreignKey: "poolsterId",
      otherKey: "playerId",
    });
    Poolster.hasMany(models.PoolsterPlayers, {
      as: "foo2",
      foreignKey: "poolsterId",
      sourceKey: "poolsterId",
    });
  };

  return Poolster;
};
