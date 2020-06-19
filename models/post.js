var db = require("../models");

module.exports = function (sequelize, DataTypes) {
  var Post = sequelize.define("Post", {
    handle: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    body: {
      type: DataTypes.TEXT,
    },
  });

  return Post;
};
