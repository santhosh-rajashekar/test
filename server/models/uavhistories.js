'use strict';
module.exports = (sequelize, DataTypes) => {
    var uavhistory = sequelize.define('uav_config_history', {
        history: DataTypes.JSONB,
        uav_id: DataTypes.INTEGER
    });

    uavhistory.associate = (models) => {
        uavhistory.belongsTo(models.uav_config_current, {
            foreignKey: 'uav_id',
            onDelete: 'CASCADE',
        });
    };
    return uavhistory;
};