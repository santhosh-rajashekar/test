"use strict";
const notificationController = require('./notifier');
const flights = require('../models').flights;
const archived_flights = require('../models').archived_flights;
const datauavs = require('../models').datauavs;
const partnumberController = require('./partnumber');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const moment = require('moment');
var _ = require('lodash');
const Sequelize = require('sequelize');
const sequelize = require('../models/index').sequelize;

const Op = Sequelize.Op;

const DIR_UPLOADS = './uploads/';
const DIR_UPLOADED = './uploaded/';

const INTERVAL_DAYS = 30;
const INTERVAL_TYPE = 'days';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, DIR_UPLOADS);
    },
    filename: function(req, file, cb) {
        cb(null, 'datafile_' + req.params.uavid + path.extname(file.originalname.toLowerCase()));
    },
    limits: {
        fileSize: 500 * 1024 * 1024
    }
});

const statusCheckedStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, DIR_UPLOADS);
    },
    filename: function(req, file, cb) {
        cb(null, req.params.filename + path.extname(file.originalname.toLowerCase()));
    },
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});


const upload = multer({
    dest: DIR_UPLOADS,
    storage: storage
}).single('file');

const statusFileUpload = multer({
    dest: DIR_UPLOADS,
    storage: statusCheckedStorage
}).single('file');

module.exports = {
    create(req, res) {
        let _metadata = req.body.metadata;
        _metadata.info.upload_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        _metadata.info.upload_filename = '';

        return flights
            .create({
                metadata: _metadata,
                uav_id: _metadata.info.id
            })
            .then(flights => res.status(200).send(flights))
            .catch(error => res.status(400).send(error));
    },
    componentCheckedStatusFileUpload(req, res) {
        statusFileUpload(req, res, function(err) {
            if (err) {
                // An error occurred when uploading
                return res.status(500).send(err);
            }

            res.status(200).send('File ' + req.file.originalname + 'was uploaded successfully!');
        });
    },
    /* page reload lost the upload history and upload file*/
    fileupload(req, res) {
        upload(req, res, function(err) {
            if (err) {
                // An error occurred when uploading
                // console.log('err: ', err);
                return res.status(500).send(err);
            }

            var body_data = JSON.parse(req.body.data);
            var _supported = [true, 'true'].indexOf(body_data.supportedDrone) >= 0;

            var _create_final_file = function(req, res, flights, _destination_filename) {
                let _destination_dir = DIR_UPLOADED;
                try {
                    if (!_supported) {
                        _destination_dir += '/unsupported/';
                    }
                    console.log("\n\n _destination_filename:", _destination_filename);
                    fs.renameSync(DIR_UPLOADS + req.file.filename, _destination_dir + _destination_filename);
                    fs.accessSync(_destination_dir + _destination_filename, fs.constants.R_OK | fs.constants.W_OK);
                    return { 'result': true };
                } catch (error) {
                    return { 'result': false, 'message': error };
                }
            };

            var createFilightEntry = function createFlight(_metadata) {

                return flights
                    .create({
                        metadata: _metadata,
                        uav_id: body_data.uavid,
                        user_id: body_data.user_id,
                        /*
                         * we are saving duplicate of this file name on metadata and filename column
                         * for changing the database structure json to relational.
                         */
                        filename: '',
                        filesize: body_data.filesize,
                        file_md5_hash: body_data.md5hash
                    })
                    .then(flights => {

                        let _destination_filename = [
                            'datafile',
                            body_data.manufacturer,
                            body_data.model,
                            flights.id
                        ].join('_') + path.extname(req.file.filename);

                        _destination_filename = _destination_filename.toLowerCase();

                        flights.update({
                                filename: _destination_filename
                            })
                            .then(flight => {
                                console.log('destination filename updated successfully');

                                var data = _create_final_file(req, res, flights, _destination_filename);

                                if (data.result) {
                                    // archived_flights.create({
                                    //     uav_id: body_data.uavid,
                                    //     flight_id: flights.id
                                    // }).then(archived_flights => {
                                    //     console.log('entry created successfully in archived_flights table');
                                    //     res.status(200).send({ 'result': true, 'flight_id': flights.id, 'destination filename': _destination_filename });
                                    // }).catch(error => {
                                    //     console.log(error);
                                    //     console.log('error in creating row in the archived_flights table');
                                    //     res.status(200).send({ 'result': false, 'message': 'Error in updating the destination filename', 'flight_id': flights.id, 'destination filename': _destination_filename });
                                    // });

                                    res.status(200).send({ 'result': true, 'flight_id': flights.id, 'destination filename': _destination_filename });
                                } else {
                                    res.status(200).send({ 'result': false, 'message': data.message, 'flight_id': flights.id, 'destination filename': _destination_filename });
                                }

                            })
                            .catch(error => {
                                console.log(error);
                                console.log('Error in updating the destination filename');
                                res.status(200).send({ 'result': false, 'message': 'Error in updating the destination filename', 'flight_id': flights.id, 'destination filename': _destination_filename });
                            });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(200).send({ 'result': false, 'message': error, 'flight_id': null, 'destination filename': _destination_filename });
                    });
            };

            if (!_supported) {

                //Note : for unsupported flights create a datauav entry if not exists and then create a flight log
                var uav_id = body_data.uavid;

                return datauavs.findById(uav_id).then(results => {
                        if (results == null) {
                            return datauavs.create({
                                    id: uav_id,
                                    data: null
                                })
                                .then(datauavs => {
                                    createFilightEntry(null);
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.status(400).send(error);
                                });
                        } else {
                            createFilightEntry(null);
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400).send(error);
                    });
            }

            return datauavs.findById(body_data.uavid)
                .then(datauavs => {
                    if (!datauavs) {
                        return res.status(404).send({
                            message: 'Uav Not Found',
                        });
                    }

                    // console.log(datauavs.data);
                    let _metadata = datauavs.data;
                    _metadata.upload_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    /*
                     * we are saving duplicate of this file name on metadata and filename column
                     * for changing the database structure json to relational.
                     */
                    _metadata.upload_filename = req.file.originalname;

                    if ([true, 'true'].indexOf(body_data.supportedDrone) >= 0) {
                        _metadata.battery = {
                            serial_number: _metadata.batteries[body_data.batteryIndex].serial_number,
                            part_no: _metadata.batteries[body_data.batteryIndex].part_no
                        };
                    }

                    createFilightEntry(_metadata);
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
        });
    },
    list(req, res) {
        return flights
            .all({
                where: {
                    uav_id: {
                        [Op.in]: req.body.ids
                    },
                    is_archived: false
                },
                order: [
                    ['id', 'DESC']
                ]
            })
            .then(flights => res.status(200).send(flights))
            .catch(error => res.status(400).send(error));
    },
    getCockpitSummary(req, res) {

        let ids;
        ids = flights.findAll({

                attributes: [
                    [Sequelize.fn('MAX', Sequelize.col('id')), "id"]
                ],
                where: {
                    uav_id: {
                        [Op.in]: req.body.ids
                    },
                    is_archived: false
                },
                group: [
                    [Sequelize.col("uav_id")]
                ]
            })
            .then(function(flight) {
                ids = _.map(flight, function(flig) {
                    return flig.id;
                });

                return flights
                    .findAll({
                        attributes: [
                            [Sequelize.json("data.status"), "status"],
                            [Sequelize.fn('COUNT', Sequelize.json("data.status")), "count"]
                        ],
                        where: {
                            id: {
                                [Op.in]: ids
                            },
                            is_archived: false
                        },
                        group: [
                            [Sequelize.json("data.status")]
                        ]
                    })
                    .then(flights => res.status(200).send(flights))
                    .catch(error => {
                        console.log(error);
                        res.status(400).send(error);
                    });
            })
            .catch(error => {
                console.log(error);
                res.status(400).send(error);
            });

    },
    componentConfirmation(req, res) {
        try {
            let _flight_id = req.params.id;
            let _component = req.body.component; // propulsion | battery | flight_controller
            let _checked = req.body.checked;
            let _checked_note = req.body.checked_note;
            let _uploadedFileName = req.body.uploadedFileName;
            let _user_id = req.body.user_id;
            let _timestamp = req.body.timestamp;

            return flights.findById(_flight_id)
                .then(flight => {
                    try {
                        if (!flight) {
                            res.status(404).send('Flight not found');
                            return;
                        }

                        flight.data.result.flight_component[_component].user_id = _user_id;
                        flight.data.result.flight_component[_component].checked = _checked;
                        flight.data.result.flight_component[_component].checked_note = _checked_note;
                        flight.data.result.flight_component[_component].uploadedFileName = _uploadedFileName;
                        flight.data.result.flight_component[_component].timestamp = _timestamp;

                        return flight.update({
                                data: flight.data
                            })
                            .then(flight => {
                                return res.status(200).send(flight);
                            })
                            .catch(error => {
                                console.log(error);
                                res.status(500).send(error);
                            });
                    } catch (error) {
                        console.log(error);
                        res.status(500).send(error);
                    }
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },

    checkFlightsChanges(req, res) {

        //This method just check if the status is received or not within the expected time and send an email based on that
        //moment() is not behaving consistently
        //TODO : Time shown on the PgAdmin 4.2 UI is not same as what we get from Sequelize data model
        var createdTime = moment().subtract(180, 'minutes').toDate();

        flights.findAll({
                attributes: ['id', 'data', 'filename', 'createdAt', 'updatedAt'],
                where: {
                    data: null,
                    metadata: {
                        $ne: null
                    },
                    is_archived: false,
                    createdAt: {
                        [Op.lt]: createdTime,
                    }
                }
            })
            .then(flights => {
                if (flights && flights.length < 1) {
                    console.log('No flight found');
                    return res.status(200).send('No flight found');
                } else {
                    console.log(flights.length + ' flights found');

                    var message = 'Flights with below details have not received any analyzed results within the expected time';
                    message = message + '<br><br>' + 'Filenames :';

                    for (var i = 0; i < flights.length; i++) {
                        message = message + '\n' + flights[i].dataValues.filename;

                        flights[i].update({
                            data: { "status": 6 },
                            updatedAt: moment().toDate(),
                        }).catch(error => {
                            console.log(error);
                        });
                    }

                    notificationController.notifyViaEmail(message).then(result => {
                        if (result && result.notified) {
                            return res.status(200).send('Email sent successfully.');
                        }
                    }).catch(result => {
                        return res.status(200).send('Sending email failed.');
                    })
                }
            }).catch(error => {
                console.log(error);
                return res.status(200).send(error);
            });
    },

    archivedFlight(req, res) {

        return flights.findById(req.params.id)
            .then(flights => {

                if (!flights) {
                    return res.status(404).send({
                        message: 'Flight Not Found'
                    });
                }

                return flights.update({
                    is_archived: true
                }).then(flights => {
                    return res.status(200).send(flights);
                }).catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
            }).catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
    },

    isDuplicateFile(req, res) {
        return flights.count({
                where: {
                    uav_id: req.params.id,
                    file_md5_hash: req.body.md5hash,
                    is_archived: false
                }
            })
            .then(flights => {
                if (flights > 0) {
                    return res.status(200).send({
                        isDuplicate: true
                    });
                } else {
                    return res.status(200).send({
                        isDuplicate: false
                    });
                }

            }).catch(error => {
                console.log(error);
                res.status(400).send(error);
            });
    },

    getArchivedFilename(req, res) {

        var date = moment().subtract(INTERVAL_DAYS, INTERVAL_TYPE).toDate();
        console.log(date);

        flights.findAll({
            attributes: ['filename', 'updatedAt'],
            where: {
                is_archived: true,
                updatedAt: {
                    [Op.lt]: date,
                }
            }
        }).then(flights => {
            console.log(JSON.stringify(flights));
            res.status(200)
                .send({
                    "filenames": JSON.stringify(flights)
                });
        }).catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
    },

    getArchivedFileDetails(req, res) {

        var date = moment().subtract(30, 'days').toDate();
        console.log(date);

        function archived_file(filename, flight_id, uav_id, manufacturer_name, manufacturer_model) {
            this.filename = filename;
            this.flight_id = flight_id;
            this.uav_id = uav_id;
            this.manufacturer_name = manufacturer_name;
            this.manufacturer_model = manufacturer_model;
        }

        flights.findAll({
            where: {
                is_archived: true,
                updatedAt: {
                    [Op.lt]: date,
                }
            }
        }).then(flights => {

            console.log(flights);
            var archivedFileDetails = [];

            for (var i = 0; i < flights.length; i++) {

                var file_details = new archived_file();
                file_details.filename = flights[i].filename;
                file_details.flight_id = flights[i].id;
                file_details.uav_id = flights[i].uav_id;
                file_details.manufacturer_name = flights[i].metadata.manufacturer_name;
                file_details.manufacturer_model = flights[i].metadata.manufacturer_model;

                archivedFileDetails.push(file_details);
            }

            res.status(200)
                .send(JSON.stringify(archivedFileDetails));
        }).catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
    },

    deleteArchivedFlights(req, res) {

        var date = moment().subtract(30, 'days').toDate();

        flights.destroy({
            where: {
                is_archived: true,
                updatedAt: {
                    [Op.lt]: date,
                }
            }
        }).then(flights => {
            console.log(JSON.parse(flights));
            res.status(200).send('deleted successfully');
        }).catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
    },

    getFlightsCountAndLastUpdatedById(req, res) {

        flights.findAll({
            attributes: ['uav_id', [Sequelize.fn('COUNT', Sequelize.col('id')), "NumberOfFlights"],
                [Sequelize.fn('MAX', Sequelize.col('updatedAt')), "LastUpdatedAt"]
            ],
            where: {
                uav_id: {
                    [Op.in]: req.body.ids
                },
                metadata: null,
                is_archived: false
            },
            group: [
                [Sequelize.col("uav_id")]
            ]
        }).then(results => {
            res.status(200).send(JSON.stringify(results));
        })
    },

    getFlightsStatusById(req, res) {

        let ids;
        ids = flights.findAll({

                attributes: [
                    [Sequelize.fn('MAX', Sequelize.col('id')), "id"]
                ],
                where: {
                    uav_id: {
                        [Op.in]: req.body.ids
                    },
                    is_archived: false
                },
                group: [
                    [Sequelize.col("uav_id")]
                ]
            })
            .then(function(flight) {

                if (flight && flight.length) {
                    ids = _.map(flight, function(flig) {
                        return flig.id;
                    });

                    sequelize.query("SELECT uav_id, data->>'status' AS lastFlightStatus FROM flights WHERE flights.id IN (:flight_ids);", { replacements: { flight_ids: ids }, type: Sequelize.QueryTypes.SELECT })
                        .then(results => {
                            res.status(200).send(JSON.stringify(results));
                        })
                } else {
                    res.status(200).send([]);
                }
            })
            .catch(error => {
                console.log(error);
                res.status(400).send(error);
            });
    },

    getmetadata(req, res) {

        let ids = req.body.flight_ids;

        try {
            sequelize.query("SELECT id AS flight_id, uav_id, user_id, filename, filesize, file_md5_hash, metadata FROM flights WHERE flights.id IN (:flight_ids);", { replacements: { flight_ids: ids }, type: Sequelize.QueryTypes.SELECT })
                .then(results => {
                    res.status(200).send(JSON.stringify(results));
                })
                .catch(error => {
                    console.log(error);
                    res.status(400).send(error);
                });
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    },

    getFlightlogDetails(req, res) {

        let ids = req.body.flight_ids;
        let fields = req.body.attributes;

        let possibleFileds = ['id', 'uav_id', 'user_id', 'filename', 'filesize', 'file_md5_hash', 'metadata', 'data', 'createdAt', 'updatedAt'];
        let selectString = "SELECT id AS flight_id";

        if (fields && fields.length) {

            for (let i = 0; i < fields.length; i++) {
                if (!possibleFileds.includes(fields[i])) {
                    res.status(400).send("Invalid attribute " + fields[i] + " requested for the Flight log");
                }
            }

            for (let i = 0; i < fields.length; i++) {
                if (fields[i] != 'id') {
                    selectString += ',' + fields[i];
                }
            }
            selectString += " FROM flights WHERE flights.id IN (:flight_ids);";

        } else {
            selectString = "SELECT id AS flight_id, uav_id, user_id, filename, filesize, file_md5_hash, metadata FROM flights WHERE flights.id IN (:flight_ids);";
        }

        try {
            sequelize.query(selectString, { replacements: { flight_ids: ids }, type: Sequelize.QueryTypes.SELECT })
                .then(results => {
                    res.status(200).send(JSON.stringify(results));
                })
                .catch(error => {
                    console.log(error);
                    res.status(400).send(error);
                });
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    },

    updateUntraceableData(req, res) {

        var flight_id = req.body.flight_id;
        var data_untraceable = req.body.data_untraceable;
        var metadata_untraceable = req.body.metadata_untraceable;

        return archived_flights.findById(flight_id)
            .then(archived_flight => {
                if (!archived_flight) {
                    res.status(404).send('Flight not found with the id : ' + flight_id);
                    return;
                }

                if (archived_flight && archived_flight.length > 0) {
                    res.status(404).send('Found more than one entry in the archived flights for the flight with id : ' + flight_id);
                    return;
                }

                return archived_flight.update({
                        data: data_untraceable,
                        metadata: metadata_untraceable
                    })
                    .then(archived_flight => {
                        //TODO : updateUntraceableData that will be passed from analysis module
                        return res.status(200).send('archived_flights update successully for flight id ' + archived_flight.flight_id);
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(500).send(error);
                    });
            })
            .catch(error => {
                console.log(error);
                res.status(500).send(error);
            });

        return true;
    },

    updateAnalysisResult(req, res) {

        var flight_id = req.body.flight_id;
        var result_code = req.body.result_code;
        var data_to_update = req.body.data;

        return flights.findById(flight_id)
            .then(flight => {
                if (!flight) {
                    res.status(404).send('Flight not found with the id : ' + flight_id);
                    return;
                }

                flight.data = data_to_update;

                return flight.update({
                        data: data_to_update
                    })
                    .then(flight => {
                        //TODO : updateUntraceableData that will be passed from analysis module
                        return res.status(200).send('flight update successully');
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(500).send(error);
                    });
            })
            .catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
    },

    updateDataConversionFailure(req, res) {

        var flight_id = req.body.flight_id;
        var result_code = req.body.result_code;
        var description = req.body.description;
        //TODO : communicate to front end and update the database, status
        res.status(200).send('ok');
    },

    getProcessdState(req, res) {

        var flight_id = req.params.flight_id;

        if (!flight_id) {
            res.status(500).send('Missing mandatory parameters flight_id');
        }

        flights.findAll({
                attributes: ['id', 'user_id', 'uav_id', 'processed_state'],
                where: {
                    id: flight_id
                }
            })
            .then(flights => {
                if (flights && flights.length < 1) {
                    var message = 'NOK, No flight found with flight id' + flight_id;
                    return res.status(200).send(message);
                } else if (flights.length == 1) {
                    return res.status(200).send(JSON.stringify(flights));
                }
            }).catch(error => {
                return res.status(200).send('Error getting the processed state, error ' + error);
            });
    }

}