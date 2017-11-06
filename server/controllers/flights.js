'use strict';

const flights = require('../models').flights;
const datauavs = require('../models').datauavs;

const multer = require('multer');
const fs = require('fs');
const path = require("path");
var _ = require('lodash');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

const DIR_UPLOADS = './uploads/';
const DIR_UPLOADED = './uploaded/';

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
        cb(null, 'statusfile_' + req.params.filename + path.extname(file.originalname.toLowerCase()));
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
        });
    },
    fileupload(req, res) {
        upload(req, res, function(err) {

            if (err) {
                // An error occurred when uploading
                // console.log('err: ', err);
                return res.status(500).send(err);
            }

            var _supported = [true, 'true'].indexOf(req.params.supportedDrone) >= 0;
            var _create_final_file = function(req, res, flights) {
                let _destination_dir = DIR_UPLOADED;
                try {
                    // console.log('req.params: ', req.params);
                    if (!_supported) {
                        _destination_dir += '/unsupported/';
                    }

                    let _destination_filename = [
                        'datafile',
                        req.params.manufacturer,
                        req.params.model,
                        _supported ? flights.id : (new Date().getTime()).toString()
                    ].join('_') + path.extname(req.file.filename);

                    _destination_filename = _destination_filename.toLowerCase();

                    console.log("\n\n _destination_filename:", _destination_filename);

                    fs.renameSync(DIR_UPLOADS + req.file.filename, _destination_dir + _destination_filename);
                    fs.accessSync(_destination_dir + _destination_filename, fs.constants.R_OK | fs.constants.W_OK);

                    res.status(200).send('File ' + req.file.originalname + ' (' + _destination_filename + ') was uploaded successfully!');
                } catch (error) {
                    res.status(500).send(error);
                }
            };

            if (!_supported) {
                _create_final_file(req, res, { id: 0 });
                return;
            }

            return datauavs.findById(req.params.uavid)
                .then(datauavs => {
                    if (!datauavs) {
                        return res.status(404).send({
                            message: 'Uav Not Found',
                        });
                    }

                    // console.log(datauavs.data);
                    let _metadata = datauavs.data;
                    _metadata.upload_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    _metadata.upload_filename = req.file.originalname;

                    if ([true, 'true'].indexOf(req.params.supportedDrone) >= 0) {
                        _metadata.battery = {
                            serial_number: _metadata.batteries[req.params.batteryIndex].serial_number,
                            part_no: _metadata.batteries[req.params.batteryIndex].part_no
                        };
                    }

                    return flights
                        .create({
                            metadata: _metadata,
                            uav_id: req.params.uavid
                        })
                        .then(flights => {
                            _create_final_file(req, res, flights);
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
    getStatus(req, res) {

        let ids;
        ids = flights.findAll({

                attributes: [
                    [Sequelize.fn('MAX', Sequelize.col('id')), "id"]
                ],
                where: {
                    uav_id: {
                        [Op.in]: req.body.ids
                    }
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
                            }
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
            let _flight_id = req.body.id;
            let _component = req.body.component; // propulsion | battery | flight_controller
            let _checked = req.body.checked;
            let _checked_note = req.body.checked_note;

            return flights.findById(_flight_id)
                .then(flight => {
                    try {
                        if (!flight) {
                            res.status(404).send('Flight not found');
                            return;
                        }

                        flight.data.result.flight_component[_component].checked = _checked;
                        flight.data.result.flight_component[_component].checked_note = _checked_note;

                        return flight.update({
                                data: flight.data
                            })
                            .then(flight => {
                                return res.status(200).send(flight);
                            })
                            .catch(error => {
                                console.log(error);
                                res.status(500).send(error);
                            });;
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
        return flights.count({
                where: {
                    data: null
                }
            })
            .then(_total => {
                // console.log('req.params.hash: ', req.params.hash);
                // console.log('_total: ', _total);

                res.status(200)
                    .send({
                        c: ((+req.params.hash >= 0 && +req.params.hash !== _total) ? 1 : 0),
                        h: _total
                    });
            })
            .catch(error => {
                console.log(error);

                res.status(500)
                    .send({
                        c: 0,
                        h: 0,
                        m: error
                    });
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
    }
};