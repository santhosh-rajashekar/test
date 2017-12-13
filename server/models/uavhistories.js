'use strict';
module.exports = (sequelize, DataTypes) => {
    var uavhistory = sequelize.define('uavhistories', {
        history: DataTypes.JSONB,
        user_id: DataTypes.INTEGER
    });

    uavhistory.associate = (models) => {
        uavhistory.belongsTo(models.datauavs, {
            foreignKey: 'uav_id',
            onDelete: 'CASCADE',
        });
    };
    return uavhistory;
};