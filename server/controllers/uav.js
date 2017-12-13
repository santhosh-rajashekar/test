'use strict';
const Sequelize = require('sequelize');
const datauavs = require('../models').datauavs;
const flights = require('../models').flights;
const uavhistories = require('../models').uavhistories;
const generateSerialNumber = require('../services').generateSerialNumber;
const uavRepository = require('../repositories').uav;
const partnumberController = require('./partnumber');

const Op = Sequelize.Op;

module.exports = {

    create(req, res) {

        let components = req.body.data;

        var generateSiNumsForComponenetsAndSave = () => {
            let serials = partnumberController.generate_serials(components);

            uavRepository.ifSerialNumberExists(serials, (result) => {
                if (!result) {

                    return datauavs
                        .create({
                            id: req.body.id,
                            data: req.body.data
                        })
                        .then(datauavs => res.status(200).send(datauavs))
                        .catch(error => res.status(400).send(error));
                } else {
                    check_serials();
                }
            });
        };

        generateSiNumsForComponenetsAndSave();
    },

    list(req, res) {
        return datauavs
            .all()
            .then(datauavs => res.status(200).send(datauavs))
            .catch(error => res.status(400).send(error));
    },

    listById(req, res) {

        return datauavs
            .findAll({
                include: [{
                    model: flights,
                    as: 'flights',
                }],
                where: {
                    id: {
                        [Op.in]: req.body.ids
                    }
                },
                order: [
                    ['flights', 'id', 'ASC']
                ]
            })
            .then(datauavs => {

                const resObj = datauavs.map(datauav => {
                    let _last_status = 31;
                    let _last_update = null;
                    let _uploaded_flights = 0;

                    if (datauav.flights.length) {
                        _uploaded_flights = datauav.flights.length;

                        let _last_flight = datauav.flights[datauav.flights.length - 1];

                        if (_last_flight.data && _last_flight.data.status) {
                            _last_status = _last_flight.data.status;
                        }

                        if (_last_flight.createdAt) {
                            _last_update = _last_flight.createdAt;
                        }
                    }

                    if (datauav.data && datauav.data.history) {
                        delete datauav.data.history;
                    }

                    return Object.assign({
                        data: datauav.data,
                        uav_id: datauav.id,
                        info: {
                            flight_hours: datauav.flights.reduce((prevVal, flight) => {
                                let flight_hours = 0;
                                if (flight && flight.data && +flight.data.flight_hours) {
                                    flight_hours = +flight.data.flight_hours;
                                }

                                return +prevVal + flight_hours;
                            }, 0),
                            flight_cycles: datauav.flights.reduce((prevVal, flight) => {
                                let flight_cycles = 0;
                                if (flight && flight.data && +flight.data.flight_cycles) {
                                    flight_cycles = +flight.data.flight_cycles;
                                }

                                return +prevVal + flight_cycles;
                            }, 0),
                            last_update: _last_update,
                            status: _last_status,
                            uploaded_flights: _uploaded_flights
                        }
                    });
                });

                res.status(200).send(resObj);
            })
            .catch(error => {
                console.log(error);
                res.status(400).send(error)
            });
    },

    update(req, res) {

        return datauavs
            .findById(req.params.id)
            .then(datauavs => {
                if (!datauavs) {
                    return res.status(404).send({
                        message: 'Uav Not Found',
                    });
                }

                return datauavs.update({

                    data: req.body.data

                }).then(datauavs => {

                    return uavhistories.create({
                            history: req.body.history,
                            uav_id: req.params.id
                        })
                        .then(history => res.status(200).send(datauavs))
                        .catch(error => {
                            res.status(400).send(error)
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
            })
            .catch(error => {
                res.status(500).send(error)
            });
    },

    createSerialNumber(req, res) {

        var serial_number = generateSerialNumber.generate(req.body.sub_system);

        var serials = [];

        serials.push({
            serial_number: serial_number,
            sub_system: req.body.sub_system
        });

        uavRepository.ifSerialNumberExists(serials, (result) => {
            if (!result) {
                res.status(200).send({
                    "serial_number": serial_number
                });
            } else {
                this(req, res);
            }
        });
    },

    delete(req, res) {
        return datauavs.findById(req.params.id)
            .then(datauavs => {

                if (!datauavs) {
                    return res.status(404).send({
                        message: 'Uav Not Found',
                    });
                }

                return datauavs.update({
                    is_archived: true
                }).then(datauavs => {

                    if (datauavs) {
                        flights.findAll({
                                attributes: ['id', 'uav_id', 'is_archived'],
                                where: {
                                    uav_id: req.params.id,
                                    is_archived: false
                                }
                            })
                            .then(results => {

                                if (!results) {
                                    console.log('There are no associated flights for the datauav + ' + req.params.id);
                                } else {
                                    flights.update({
                                        is_archived: true
                                    }, {
                                        where: {
                                            uav_id: req.params.id,
                                            is_archived: false
                                        }
                                    }).then(flights => {
                                        console.log('Associated flights are also archived for the datauav + ' + req.params.id);
                                    }).catch(error => {
                                        console.log(error);
                                        console.log('Error in Archiving Associated flights for the datauav + ' + req.params.id);
                                    });
                                }
                            }).catch(error => {
                                console.log(error);
                                console.log('Error in Archiving Associated flights for the datauav + ' + req.params.id);
                            });

                        return res.status(200).send(datauavs);
                    } else {
                        return res.status(404).send({
                            message: 'Uav Not Found',
                        });
                    }

                }).catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
            });
    },
}