'use strict';

module.exports = (sequelize, DataTypes) => {

    var datauavs = sequelize.define('uav_config_current', {
        data: DataTypes.JSONB,
        is_archived: DataTypes.BOOLEAN
    }, {
        freezeTableName: true
    });

    datauavs.associate = (models) => {
        datauavs.hasMany(models.flights_active, {
            foreignKey: 'uav_id',
            as: 'flights_active',
        });

        datauavs.hasMany(models.uav_config_history, {
            foreignKey: 'uav_id',
            as: 'uav_config_history',
        });
    };

    return datauavs;
};