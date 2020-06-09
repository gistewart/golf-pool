module.exports = function (sequelize, DataTypes) {
  var Poolster = sequelize.define("Poolster", {
    poolsterId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    handle: DataTypes.STRING,
    image: {
      type: DataTypes.STRING,
      defaultValue:
        "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_294,q_auto,w_220/headshots_28237.png",
    },
  });

  Poolster.associate = function (models) {
    Poolster.belongsToMany(models.Player, {
      through: models.PoolsterPlayers,
      as: "Players",
      foreignKey: "poolsterId",
      otherKey: "playerId",
    });
    Poolster.hasMany(models.PoolsterPlayers, {
      as: "PoolsterPlayers",
      foreignKey: "poolsterId",
      sourceKey: "poolsterId",
    });
  };

  return Poolster;
};
