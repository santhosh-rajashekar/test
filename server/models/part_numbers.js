'use strict';
module.exports = (sequelize, DataTypes) => {
    var part_numbers = sequelize.define('uav_config_meta', {
        UAV_Model: DataTypes.STRING,
        UAV_Manufacturer: DataTypes.STRING,
        UAV_Version: DataTypes.STRING,
        UAV_Configuration: DataTypes.JSONB
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });
    return part_numbers;
};