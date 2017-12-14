'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const generateSerialNumber = require('../services').generateSerialNumber;

const uavModel = require('../models').datauavs;

module.exports = {

  ifSerialNumberExists(serial_number, callback) {

    var _query_or = [];
    for (var i = 0; i < serial_number.length; i++) {
      switch (serial_number[i].sub_system) {
        case 'F':
          _query_or.push({
            "data": {
              [Op.contains]: {
                fcs: [{
                  serial_number: serial_number[i].serial_number
                }]
              }
            }
          });
          break;
        case 'B':
          _query_or.push({
            "data": {
              [Op.contains]: {
                batteries: [{
                  serial_number: serial_number[i].serial_number
                }]
              }
            }
          });
          break;
        case 'M':
          _query_or.push({
            "data": {
              [Op.contains]: {
                components: [
                  {
                    bldc: {serial_number: serial_number[i].serial_number}
                  }
                ]
              }
            }
          });
          break;
        case 'E':
          _query_or.push({
            "data": {
              [Op.contains]: {
                components: [
                  {
                    esc: {serial_number: serial_number[i].serial_number}
                  }
                ]
              }
            }
          });
          break;
        case 'P':
          _query_or.push({
            "data": {
              [Op.contains]: {
                components: [
                  {
                    prop: {serial_number: serial_number[i].serial_number}
                  }
                ]
              }
            }
          });
          break;
      }

    }

    return uavModel.findAll({
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'no_uav']],
      where: {
        [Op.or]: _query_or
      }
    }).then(datauavs => {

      // console.log('count:', datauavs[0].toJSON().no_uav);

      if ( datauavs[0].toJSON().no_uav > 0 ) {

        var result = true;

        return callback(result);
      } else {

        var result = false;
        return callback(result);
      }


    }).catch(error => {
        console.log(error);
        callback(false);
      });
  }
}