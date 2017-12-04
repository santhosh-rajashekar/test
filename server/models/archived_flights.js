'use strict';
module.exports = (sequelize, DataTypes) => {
    var archived_flights = sequelize.define('archived_flights', {
        uav_id: DataTypes.INTEGER,
        metadata: DataTypes.JSONB,
        analytical_results_frontend: DataTypes.JSONB,
        analytical_results_statistics: DataTypes.JSONB
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });
    return archived_flights;
};