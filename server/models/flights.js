'use strict';
module.exports = (sequelize, DataTypes) => {
    var flights = sequelize.define('flights', {
        uav_id: DataTypes.INTEGER,
        metadata: DataTypes.JSONB,
        data: DataTypes.JSONB,
        is_archived: DataTypes.BOOLEAN,
        filename: DataTypes.STRING,
        file_md5_hash: DataTypes.STRING,
        filesize: DataTypes.BIGINT,
        user_id: DataTypes.INTEGER,
    });

    flights.associate = (models) => {
        flights.belongsTo(models.datauavs, {
            foreignKey: 'uav_id',
            onDelete: 'CASCADE'
        });
    };
    return flights;
};