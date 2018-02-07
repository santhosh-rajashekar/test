'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.renameTable('part_numbers', 'uav_config_meta');
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