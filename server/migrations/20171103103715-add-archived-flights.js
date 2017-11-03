'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('flights', 'is_archived', {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
