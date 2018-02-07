'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.renameTable('uavhistories', 'uav_config_history');
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