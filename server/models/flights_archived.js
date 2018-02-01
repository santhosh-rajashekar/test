'use strict';
module.exports = (sequelize, DataTypes) => {
    var flights_archived = sequelize.define('flights_archived', {
        uav_id: DataTypes.INTEGER,
        flight_id: DataTypes.INTEGER,
        metadata: DataTypes.JSONB,
        data: DataTypes.JSONB
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });

    return flights_archived;
};