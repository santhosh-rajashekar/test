'use strict';

const partnumber = require('../models').part_numbers;
const flights = require('../models').flights;
const archived_flights = require('../models').archived_flights;
const datauavs = require('../models').datauavs;
const partnumberController = require('./partnumber');
const uavhistories = require('../models').uavhistories;

const express = require('express');
const mailer = require('express-mailer');
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const moment = require('moment');
var _ = require('lodash');
const Sequelize = require('sequelize');
const sequelize = require('../models/index').sequelize;
const Op = Sequelize.Op;


var getUAVIdsWithSerialNumber = function(serialNumber) {

    var listOfUavId = [];
    return flights.findAll({
        attributes: ['metadata', 'data', 'uav_id'],
        where: {
            metadata: {
                $ne: null
            },
            is_archived: false
        },
    }).then(flights => {

        if (flights && flights.length > 0) {

            for (let i = 0; i < flights.length; i++) {
                var uav_metadata = flights[i].metadata;
                var uav_id = flights[i].uav_id;
                var serialNumberExist = partnumberController.containsSerialNumber(uav_metadata, serialNumber);
                if (serialNumberExist) {
                    if (listOfUavId.includes(uav_id) == false) {
                        listOfUavId.push(uav_id);
                    }
                }
            }
        }
        console.log('listOfUavId found are ');
        console.log(listOfUavId);
        return listOfUavId;

    }).catch(error => {
        console.log(error);
        return listOfUavId;
    });
};

var getUAVIdsWithPartNumber = function(partNumber) {

    var listOfUavId = [];
    return flights.findAll({
        attributes: ['metadata', 'data', 'uav_id'],
        where: {
            metadata: {
                $ne: null
            },
            is_archived: false
        },
    }).then(flights => {

        if (flights && flights.length > 0) {

            for (let i = 0; i < flights.length; i++) {
                var uav_metadata = flights[i].metadata;
                var uav_id = flights[i].uav_id;
                var serialNumberExist = partnumberController.containsPartNumber(uav_metadata, partNumber);
                if (serialNumberExist) {
                    if (listOfUavId.includes(uav_id) == false) {
                        listOfUavId.push(uav_id);
                    }
                }
            }
        }
        return listOfUavId;

    }).catch(error => {
        console.log(error);
        return listOfUavId;
    });
};

var getUAVIdsWithPartNumberAndPosition = function(partNumber, position) {

    var listOfUavId = [];
    return flights.findAll({
        attributes: ['metadata', 'data', 'uav_id'],
        where: {
            metadata: {
                $ne: null
            },
            is_archived: false
        },
    }).then(flights => {

        if (flights && flights.length > 0) {

            for (let i = 0; i < flights.length; i++) {
                var uav_metadata = flights[i].metadata;
                var uav_id = flights[i].uav_id;
                var serialNumberExist = partnumberController.containsPartNumberAtPos(uav_metadata, partNumber, position);
                if (serialNumberExist) {
                    if (listOfUavId.includes(uav_id) == false) {
                        listOfUavId.push(uav_id);
                    }
                }
            }
        }
        return listOfUavId;

    }).catch(error => {
        console.log(error);
        return listOfUavId;
    });
};

var getReasonsForComponentUpdateByUAVIDs = function(req, res) {

    var uav_ids = req.params.uav_ids;
    var preventive_replacement = 0;
    var detected_failure = 0;
    var change_for_testing = 0;
    var miscellaneous = 0;

    var reasonsForComponenetsUpdate = {
        'Preventative': preventive_replacement,
        'Replacement': detected_failure,
        'Change': change_for_testing,
        'Miscellaneous': miscellaneous
    };

    return uavhistories.findAll({
        attributes: ['history'],
        where: {
            uav_id: {
                [Op.in]: uav_ids
            },
        }
    }).then(uavhistories => {

        if (uavhistories && uavhistories.length > 0) {

            for (let i = 0; i < uavhistories.length; i++) {
                var history = uavhistories[i].history;

                if (history.fcs && history.fcs.length) {

                    for (let i = 0; i < history.fcs.length; i++) {

                        if (history.fcs[i].old && history.fcs[i].old.change_reason) {

                            var reason = history.fcs[i].old.change_reason;
                            if (reason == 1) {
                                preventive_replacement++;
                            } else if (reason == 2) {
                                detected_failure++;
                            } else if (reason == 3) {
                                change_for_testing++;
                            } else if (reason == 4) {
                                miscellaneous++;
                            }
                        }
                    }
                }

                if (history.components && history.components.length) {

                    for (let i = 0; i < history.components.length; i++) {

                        if (history.components[i].old && history.components[i].old.bldc) {

                            var reason = history.components[i].old.bldc.change_reason;
                            if (reason == 1) {
                                preventive_replacement++;
                            } else if (reason == 2) {
                                detected_failure++;
                            } else if (reason == 3) {
                                change_for_testing++;
                            } else if (reason == 4) {
                                miscellaneous++;
                            }
                        }

                        if (history.components[i].old && history.components[i].old.esc) {

                            var reason = history.components[i].old.esc.change_reason;
                            if (reason == 1) {
                                preventive_replacement++;
                            } else if (reason == 2) {
                                detected_failure++;
                            } else if (reason == 3) {
                                change_for_testing++;
                            } else if (reason == 4) {
                                miscellaneous++;
                            }
                        }

                        if (history.components[i].old && history.components[i].old.prop) {

                            var reason = history.components[i].old.prop.change_reason;
                            if (reason == 1) {
                                preventive_replacement++;
                            } else if (reason == 2) {
                                detected_failure++;
                            } else if (reason == 3) {
                                change_for_testing++;
                            } else if (reason == 4) {
                                miscellaneous++;
                            }
                        }
                    }
                }
            }

            reasonsForComponenetsUpdate.Preventative = preventive_replacement;
            reasonsForComponenetsUpdate.Replacement = detected_failure;
            reasonsForComponenetsUpdate.Change = change_for_testing;
            reasonsForComponenetsUpdate.Miscellaneous = miscellaneous;

            res.status(200).send(JSON.stringify(reasonsForComponenetsUpdate));
        } else {
            res.status(200).send(JSON.stringify(reasonsForComponenetsUpdate));
        }

    }).catch(error => {
        console.log(error);
        res.status(200).send(JSON.stringify('Error while getting the reasons for components update '));
    });
};

module.exports = {
    getTotalFlightHoursByPN(req, res) {

        var partNumber = req.params.part_number;

        getUAVIdsWithPartNumber(partNumber).then(listOfUavId => {

            if (listOfUavId.length > 0) {
                sequelize.query("SELECT SUM(CAST(data->>'flight_hours' AS REAL)) AS TotalFlightHours, SUM(CAST(data->>'flight_cycles' AS REAL)) AS TotalFlightCycles FROM flights WHERE flights.uav_id IN (:uav_ids);", { replacements: { uav_ids: listOfUavId }, type: Sequelize.QueryTypes.SELECT })
                    .then(results => {
                        res.status(200).send(JSON.stringify(results));
                    })
            } else {
                res.status(200).send(JSON.stringify('No flights found with the part_number ' + partNumber));
            }
        });
    },

    getTotalFlightHoursAndCycleyByPNPOS(req, res) {

        var partNumber = req.params.part_number;
        var position = req.params.position;

        getUAVIdsWithPartNumberAndPosition(partNumber, position).then(listOfUavId => {

            if (listOfUavId.length > 0) {
                sequelize.query("SELECT SUM(CAST(data->>'flight_hours' AS REAL)) AS TotalFlightHours, SUM(CAST(data->>'flight_cycles' AS REAL)) AS TotalFlightCycles FROM flights WHERE flights.uav_id IN (:uav_ids);", { replacements: { uav_ids: listOfUavId }, type: Sequelize.QueryTypes.SELECT })
                    .then(results => {
                        res.status(200).send(JSON.stringify(results));
                    })
            } else {
                res.status(200).send(JSON.stringify('No flights found with the part_number ' + partNumber + ' at position ' + position));
            }
        });
    },

    getTotalFlightHoursAndCycleyBySN(req, res) {

        var serialNumber = req.params.serial_number;

        getUAVIdsWithSerialNumber(serialNumber).then(listOfUavId => {

            if (listOfUavId.length > 0) {
                sequelize.query("SELECT SUM(CAST(data->>'flight_hours' AS REAL)) AS TotalFlightHours, SUM(CAST(data->>'flight_cycles' AS REAL)) AS TotalFlightCycles FROM flights WHERE flights.uav_id IN (:uav_ids);", { replacements: { uav_ids: listOfUavId }, type: Sequelize.QueryTypes.SELECT })
                    .then(results => {
                        res.status(200).send(JSON.stringify(results));
                    })
            } else {
                res.status(200).send(JSON.stringify('No flights found with that serial number ' + serialNumber));
            }
        });
    },

    getAllFlightLocationsBySN(req, res) {

        var serialNumber = req.params.serial_number;

        getUAVIdsWithSerialNumber(serialNumber).then(listOfUavId => {

            if (listOfUavId.length > 0) {
                sequelize.query("SELECT data->>'location' AS FlightLocations FROM flights WHERE flights.uav_id IN (:uav_ids) and data->>'location' != '' GROUP BY data->>'location';", { replacements: { uav_ids: listOfUavId }, type: Sequelize.QueryTypes.SELECT })
                    .then(results => {
                        res.status(200).send(JSON.stringify(results));
                    });
            } else {
                res.status(200).send(JSON.stringify('No flights found with that serial number ' + serialNumber));
            }
        });
    },

    getReasonsForComponentUpdateForAllUAVs(req, res) {

        var preventive_replacement = 0;
        var detected_failure = 0;
        var change_for_testing = 0;
        var miscellaneous = 0;

        var reasonsForComponenetsUpdate = {
            'Preventative': preventive_replacement,
            'Replacement': detected_failure,
            'Change': change_for_testing,
            'Miscellaneous': miscellaneous
        };

        return uavhistories.findAll({
            attributes: ['uav_id', 'history']
        }).then(uavhistories => {

            if (uavhistories && uavhistories.length > 0) {

                for (let i = 0; i < uavhistories.length; i++) {
                    var history = uavhistories[i].history;

                    if (history.fcs && history.fcs.length) {

                        for (let i = 0; i < history.fcs.length; i++) {

                            if (history.fcs[i].old && history.fcs[i].old.change_reason) {

                                var reason = history.fcs[i].old.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }
                        }
                    }

                    if (history.components && history.components.length) {

                        for (let i = 0; i < history.components.length; i++) {

                            if (history.components[i].old && history.components[i].old.bldc) {

                                var reason = history.components[i].old.bldc.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }

                            if (history.components[i].old && history.components[i].old.esc) {

                                var reason = history.components[i].old.esc.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }

                            if (history.components[i].old && history.components[i].old.prop) {

                                var reason = history.components[i].old.prop.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }
                        }
                    }
                }

                reasonsForComponenetsUpdate.Preventative = preventive_replacement;
                reasonsForComponenetsUpdate.Replacement = detected_failure;
                reasonsForComponenetsUpdate.Change = change_for_testing;
                reasonsForComponenetsUpdate.Miscellaneous = miscellaneous;

                res.status(200).send(JSON.stringify(reasonsForComponenetsUpdate));
            } else {
                res.status(200).send(JSON.stringify(reasonsForComponenetsUpdate));
            }

        }).catch(error => {
            console.log(error);
            res.status(200).send(JSON.stringify('Error while getting the reasons for components update '));
        });
    },

    getReasonsForComponentUpdateByUAVID(req, res) {

        var uav_id = req.params.uav_id;
        var preventive_replacement = 0;
        var detected_failure = 0;
        var change_for_testing = 0;
        var miscellaneous = 0;

        var reasonsForComponenetsUpdate = {
            'Preventative': preventive_replacement,
            'Replacement': detected_failure,
            'Change': change_for_testing,
            'Miscellaneous': miscellaneous
        }

        return uavhistories.findAll({
            attributes: ['uav_id', 'history'],
            where: {
                'uav_id': uav_id
            }
        }).then(uavhistories => {

            if (uavhistories && uavhistories.length > 0) {

                for (let i = 0; i < uavhistories.length; i++) {
                    var history = uavhistories[i].history;

                    if (history.fcs && history.fcs.length) {

                        for (let i = 0; i < history.fcs.length; i++) {

                            if (history.fcs[i].old && history.fcs[i].old.change_reason) {

                                var reason = history.fcs[i].old.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }
                        }
                    }

                    if (history.components && history.components.length) {

                        for (let i = 0; i < history.components.length; i++) {

                            if (history.components[i].old && history.components[i].old.bldc) {

                                var reason = history.components[i].old.bldc.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }

                            if (history.components[i].old && history.components[i].old.esc) {

                                var reason = history.components[i].old.esc.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }

                            if (history.components[i].old && history.components[i].old.prop) {

                                var reason = history.components[i].old.prop.change_reason;
                                if (reason == 1) {
                                    preventive_replacement++;
                                } else if (reason == 2) {
                                    detected_failure++;
                                } else if (reason == 3) {
                                    change_for_testing++;
                                } else if (reason == 4) {
                                    miscellaneous++;
                                }
                            }
                        }
                    }
                }

                reasonsForComponenetsUpdate.Preventative = preventive_replacement;
                reasonsForComponenetsUpdate.Replacement = detected_failure;
                reasonsForComponenetsUpdate.Change = change_for_testing;
                reasonsForComponenetsUpdate.Miscellaneous = miscellaneous;

                res.status(200).send(JSON.stringify(reasonsForComponenetsUpdate));
            } else {
                res.status(200).send(JSON.stringify(reasonsForComponenetsUpdate));
            }

        }).catch(error => {
            console.log(error);
            res.status(200).send(JSON.stringify('Error while getting the reasons for components update '));
        });
    },

    getReasonsForComponentUpdateByMM(req, res) {

        var manufacturer = req.params.manufacturer;
        var model = req.params.model;

        var preventive_replacement = 0;
        var detected_failure = 0;
        var change_for_testing = 0;
        var miscellaneous = 0;

        var reasonsForComponenetsUpdate = {
            'Preventative': preventive_replacement,
            'Replacement': detected_failure,
            'Change': change_for_testing,
            'Miscellaneous': miscellaneous
        }

        return partnumber
            .all({
                attributes: ['id', 'name', 'model'],
                where: {
                    'name': manufacturer,
                    'model': model
                }
            })
            .then(partnumber => {
                if (partnumber && partnumber.length == 1) {

                    var id = partnumber[0].id.toString();

                    return uavhistories.findAll({
                        attributes: ['uav_id', 'history']
                    }).then(uavhistories => {

                        if (uavhistories && uavhistories.length > 0) {

                            for (let i = 0; i < uavhistories.length; i++) {
                                var history = uavhistories[i].history;

                                if (history.fcs && history.fcs.length) {

                                    for (let i = 0; i < history.fcs.length; i++) {

                                        if (history.fcs[i].old && history.fcs[i].old.change_reason && history.fcs[i].old.part_no == id) {

                                            var reason = history.fcs[i].old.change_reason;
                                            if (reason == 1) {
                                                preventive_replacement++;
                                            } else if (reason == 2) {
                                                detected_failure++;
                                            } else if (reason == 3) {
                                                change_for_testing++;
                                            } else if (reason == 4) {
                                                miscellaneous++;
                                            }
                                        }
                                    }
                                }

                                if (history.components && history.components.length) {

                                    for (let i = 0; i < history.components.length; i++) {

                                        if (history.components[i].old && history.components[i].old.bldc && history.components[i].old.bldc.part_no == id) {

                                            var reason = history.components[i].old.bldc.change_reason;
                                            if (reason == 1) {
                                                preventive_replacement++;
                                            } else if (reason == 2) {
                                                detected_failure++;
                                            } else if (reason == 3) {
                                                change_for_testing++;
                                            } else if (reason == 4) {
                                                miscellaneous++;
                                            }
                                        }

                                        if (history.components[i].old && history.components[i].old.esc && history.components[i].old.esc.part_no == id) {

                                            var reason = history.components[i].old.esc.change_reason;
                                            if (reason == 1) {
                                                preventive_replacement++;
                                            } else if (reason == 2) {
                                                detected_failure++;
                                            } else if (reason == 3) {
                                                change_for_testing++;
                                            } else if (reason == 4) {
                                                miscellaneous++;
                                            }
                                        }

                                        if (history.components[i].old && history.components[i].old.prop && history.components[i].old.prop.part_no == id) {

                                            var reason = history.components[i].old.prop.change_reason;
                                            if (reason == 1) {
                                                preventive_replacement++;
                                            } else if (reason == 2) {
                                                detected_failure++;
                                            } else if (reason == 3) {
                                                change_for_testing++;
                                            } else if (reason == 4) {
                                                miscellaneous++;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        reasonsForComponenetsUpdate.Preventative = preventive_replacement;
                        reasonsForComponenetsUpdate.Replacement = detected_failure;
                        reasonsForComponenetsUpdate.Change = change_for_testing;
                        reasonsForComponenetsUpdate.Miscellaneous = miscellaneous;

                        res.status(200).send(JSON.stringify(reasonsForComponenetsUpdate));

                    }).catch(error => {
                        console.log(error);
                        res.status(200).send('Error while getting the reasons for components update ');
                    });

                } else {
                    res.status(200).send(JSON.stringify('Manufacturer or Model are not found, check the provided details and try again.'));
                }
            })
            .catch(error => res.status(400).send(error));
    },

    getReasonsForComponentUpdateByPN(req, res) {

        var partNumber = req.params.part_number;

        getUAVIdsWithPartNumber(partNumber).then(listOfUavId => {

            if (listOfUavId.length > 0) {
                req.params.uav_ids = listOfUavId;
                return getReasonsForComponentUpdateByUAVIDs(req, res);
            } else {
                res.status(200).send('No component found with the part_number ' + partNumber + ' check the provided part number and try again!');
            }
        });
    },

    getAnalysisResultsBySN(req, res) {

        var serialNumber = req.params.serial_number;

        getUAVIdsWithSerialNumber(serialNumber).then(listOfUavId => {

            if (listOfUavId.length > 0) {

                sequelize.query("SELECT data->>'status' AS Status FROM flights WHERE flights.uav_id IN (:uav_ids) and data != 'null';", { replacements: { uav_ids: listOfUavId }, type: Sequelize.QueryTypes.SELECT })
                    .then(results => {

                        if (results && results.length) {
                            for (let i = 0; i < results.length; i++) {
                                var status = results[i].status;
                                if (status == '1') {
                                    results[i] = "Good to fly";
                                } else if (status == '2') {
                                    results[i] = "Information";
                                } else if (status == '3') {
                                    results[i] = "Minor issue";
                                } else if (status == '4') {
                                    results[i] = "Critical issue";
                                } else if (status == '6') {
                                    results[i] = "Failure processing flight log";
                                }
                            }
                        }

                        res.status(200).send(JSON.stringify(results));
                    })

            } else {
                res.status(200).send(JSON.stringify('No component found with the serial_number ' + serialNumber + ' check the provided serial number and try again!'));
            }
        });
    },

};