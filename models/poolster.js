module.exports = function (sequelize, DataTypes) {
  var Poolster = sequelize.define(
    "Poolster",
    {
      poolsterId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      handle: DataTypes.STRING,

      StartDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      EndDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

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
    Poolster.hasOne(models.PoolsterImage, {
      foreignKey: "id",
      sourceKey: "poolsterId",
    });
  };

  return Poolster;
};
