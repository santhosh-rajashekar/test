'use strict';

const flights = require('../models').flights;
const datauavs = require('../models').datauavs;

const express = require('express');
const mailer = require('express-mailer');
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const moment = require('moment');
var _ = require('lodash');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;
const app = express();
app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');
const sendMailer = mailer.extend(app, {
    from: 'hcm-admin@safe-drone.com',
    host: 'smtp.safe-drone.com', // hostname
    secureConnection: false, // use SSL
    port: 587, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: 'hcm-admin@safe-drone.com',
        pass: 'hcm0nlyc@nsend'
    }
});

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

            var _supported = [true, 'true'].indexOf(JSON.parse(req.body.data).supportedDrone) >= 0;
            var _create_final_file = function(req, res, flights) {
                let _destination_dir = DIR_UPLOADED;
                try {
                    if (!_supported) {
                        _destination_dir += '/unsupported/';
                    }

                    let _destination_filename = [
                        'datafile',
                        JSON.parse(req.body.data).manufacturer,
                        JSON.parse(req.body.data).model,
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

            return datauavs.findById(JSON.parse(req.body.data).uavid)
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

                    if ([true, 'true'].indexOf(JSON.parse(req.body.data).supportedDrone) >= 0) {
                        _metadata.battery = {
                            serial_number: _metadata.batteries[JSON.parse(req.body.data).batteryIndex].serial_number,
                            part_no: _metadata.batteries[JSON.parse(req.body.data).batteryIndex].part_no
                        };
                    }

                    return flights
                        .create({
                            metadata: _metadata,
                            uav_id: JSON.parse(req.body.data).uavid,
                            user_id: JSON.parse(req.body.data).user_id,
                            /*
                             * we are saving duplicate of this file name on metadata and filename column
                             * for changing the database structure json to relational.
                             */
                            filename: _metadata.upload_filename,
                            file_md5_hash: JSON.parse(req.body.data).md5hash
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
        return flights.count({
                where: {
                    data: null,
                    is_archived: false
                }
            })
            .then(_total => {
                // console.log('req.params.hash: ', req.params.hash);
                // console.log('_total: ', _total);
                if (_total > 0) {
                    flights.findAll({
                        attributes: ['id', 'data', 'createdAt', 'updatedAt'],
                        where: {
                            data: null,
                            is_archived: false,
                            createdAt: {
                                [Op.lt]: moment().subtract(15, 'minutes').toDate(),
                            }
                        }
                    }).then(results => {
                        if (!results) {
                            console.log('no flights found');
                            return;
                        }

                        flights.update({
                                data: { "status": 6 },
                                updatedAt: moment().toDate(),
                            }, {
                                where: {
                                    data: null,
                                    is_archived: false,
                                    createdAt: {
                                        [Op.lt]: moment().subtract(30, 'minutes').toDate(),
                                    }
                                }
                            })
                            .then(flights => {

                                if (flights) {

                                    if (process.env.NODE_ENV == 'production') {
                                        sendMailer.mailer.send('email', {
                                            to: 'philipp.koehler@lht.dlh.de', // REQUIRED. This can be a comma delimited string just like a normal email to field. 
                                            subject: 'There is some problems in the data processing', // REQUIRED.
                                            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
                                        }, function(err) {

                                            if (err) {
                                                // handle error
                                                console.log(err);
                                                //res.send('There was an error sending the email');
                                                // return;
                                            }

                                            req.params.hash++;
                                            _total = req.params.hash + 1;
                                            res.status(200)
                                                .send({
                                                    c: ((+req.params.hash >= 0 && +req.params.hash !== _total) ? 1 : 0),
                                                    h: _total
                                                });

                                            console.log('Email Sent');
                                        });
                                    }

                                    console.log('status updated');
                                }
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }).catch(error => {
                        console.log(error);
                    });
                } else {
                    res.status(200)
                        .send({
                            c: 0,
                            h: 0
                        });
                }
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

                console.log(flights);
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
                res.status(500).send(error);
            });
    },
};