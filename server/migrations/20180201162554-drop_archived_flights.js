'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('archived_flights');
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('archived_flights');
    }
};