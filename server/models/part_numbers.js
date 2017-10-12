'use strict';
module.exports = (sequelize, DataTypes) => {
  var part_numbers = sequelize.define('part_numbers', {
    model: DataTypes.STRING,
    name: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return part_numbers;
};