'use strict';
module.exports = (sequelize, DataTypes) => {
    var archived_flights = sequelize.define('archived_flights', {
        uav_id: DataTypes.INTEGER,
        data: DataTypes.JSONB,
        metadata: DataTypes.JSONB
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });
    return archived_flights;
};