'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('flights_archived', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            uav_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            flight_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            metadata: {
                type: Sequelize.JSONB
            },
            data: {
                type: Sequelize.JSONB
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('flights_archived');
    }
};