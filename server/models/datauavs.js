'use strict';

module.exports = (sequelize, DataTypes) => {

    var datauavs = sequelize.define('datauavs', {
        data: DataTypes.JSONB,
        is_archived: DataTypes.BOOLEAN
    });

    datauavs.associate = (models) => {
        datauavs.hasMany(models.flights, {
            foreignKey: 'uav_id',
            as: 'flights',
        });

        datauavs.hasMany(models.uavhistories, {
            foreignKey: 'uav_id',
            as: 'uavhistories',
        });
    };

    return datauavs;
};