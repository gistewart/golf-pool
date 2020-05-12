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
    Poolster.hasMany(models.PoolsterPlayers, {
      foreignKey: "poolsterId",
      sourceKey: "poolsterId",
    });
    // Poolster.belongsToMany(models.Player, {
    //   through: models.PoolsterPlayers,
    //   foreignKey: "poolsterId",
    //   otherKey: "playerId",
    // });
  };

  return Poolster;
};
