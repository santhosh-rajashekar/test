'use strict';
module.exports = (sequelize, DataTypes) => {
    var flights = sequelize.define('flights_active', {
        uav_id: DataTypes.INTEGER,
        metadata: DataTypes.JSONB,
        data: DataTypes.JSONB,
        is_archived: DataTypes.BOOLEAN,
        filename: DataTypes.STRING,
        file_md5_hash: DataTypes.STRING,
        filesize: DataTypes.BIGINT,
        user_id: DataTypes.INTEGER,
        processed_state: DataTypes.JSONB
    }, {
        freezeTableName: true
    });

    flights.associate = (models) => {
        flights.belongsTo(models.uav_config_current, {
            foreignKey: 'uav_id',
            onDelete: 'CASCADE'
        });
    };
    return flights;
};