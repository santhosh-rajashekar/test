'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('flights', 'updatedAt', {
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'),
    })
},

    down:(queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    }
};