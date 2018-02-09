'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.renameTable('datauavs', 'uav_config_current');
    },

    down: (queryInterface, Sequelize) => {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.dropTable('users');
        */
    }
};