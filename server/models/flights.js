'use strict';
module.exports = (sequelize, DataTypes) => {
  var flights = sequelize.define('flights', {
    uav_id: DataTypes.INTEGER,
    metadata: DataTypes.JSONB,
    data: DataTypes.JSONB
  });

  flights.associate = (models) => {
    flights.belongsTo(models.datauavs, {
      foreignKey: 'uav_id',
      onDelete: 'CASCADE',
    });
  };
  return flights;
};