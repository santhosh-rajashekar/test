const uavRepository = require('../repositories').uav;

module.exports = {

  generate(subSystem) {

    let sn_prefix = "C";

    var randomString = function(length, chars) {
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];


      return result;
    };

    var createSerialNumber = function(subSystem) {

      return sn_prefix + '-' + subSystem
        + randomString(2, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        + '-' + randomString(3, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    };

    var serial_number = createSerialNumber(subSystem);

    return serial_number;
  }
}