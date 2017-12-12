'use strict';

const flights = require('../models').flights;
const archived_flights = require('../models').archived_flights;
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

            var _create_final_file = function(req, res, flights, _destination_filename) {
                let _destination_dir = DIR_UPLOADED;
                try {
                    if (!_supported) {
                        _destination_dir += '/unsupported/';
                    }
                    console.log("\n\n _destination_filename:", _destination_filename);
                    fs.renameSync(DIR_UPLOADS + req.file.filename, _destination_dir + _destination_filename);
                    fs.accessSync(_destination_dir + _destination_filename, fs.constants.R_OK | fs.constants.W_OK);

                    res.status(200).send('File ' + req.file.originalname + ' (' + _destination_filename + ') was uploaded successfully!');
                } catch (error) {
                    res.status(500).send(error);
                }
            };

            if (!_supported) {

                let _destination_filename = [
                    'datafile',
                    JSON.parse(req.body.data).manufacturer,
                    JSON.parse(req.body.data).model,
                    _supported ? flights.id : (new Date().getTime()).toString()
                ].join('_') + path.extname(req.file.filename);

                _destination_filename = _destination_filename.toLowerCase();

                _create_final_file(req, res, { id: 0 }, _destination_filename);
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
                            filename: '',
                            file_md5_hash: JSON.parse(req.body.data).md5hash
                        })
                        .then(flights => {

                            let _destination_filename = [
                                'datafile',
                                JSON.parse(req.body.data).manufacturer,
                                JSON.parse(req.body.data).model,
                                _supported ? flights.id : (new Date().getTime()).toString()
                            ].join('_') + path.extname(req.file.filename);

                            _destination_filename = _destination_filename.toLowerCase();

                            flights.update({
                                    filename: _destination_filename
                                })
                                .then(flight => {
                                    console.log('destination filename updated successfully');

                                    _create_final_file(req, res, flights, _destination_filename);

                                    archived_flights.create({
                                        uav_id: JSON.parse(req.body.data).uavid
                                    }).then(archived_flights => {
                                        console.log('entry created successfully in archived_flights table');
                                    }).catch(error => {
                                        console.log(error);
                                        console.log('error in creating row in the archived_flights table');
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    console.log('Error in updating the destination filename');
                                });
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
                var responseFn = function() {
                    res.status(200).send({
                        c: ((+req.params.hash >= 0 && +req.params.hash !== _total) ? 1 : 0),
                        h: _total
                    });
                };

                if (_total > 0) {

                    //moment() is not behaving consistently
                    //TODO : to be verified, hence switching default javascript to get the local time on server
                    var createdTime = moment().subtract(60, 'minutes').toDate();

                    flights.findAll({
                            attributes: ['id', 'data', 'filename', 'createdAt', 'updatedAt'],
                            where: {
                                data: null,
                                is_archived: false,
                                createdAt: {
                                    [Op.lt]: createdTime,
                                }
                            }
                        })
                        .then(flights => {

                            if (flights && flights.length < 1) {
                                console.log('No flight found');
                                responseFn();
                            } else {
                                console.log(flights.length + ' flights found');

                                var message = 'Flights with below details have not received any analyzed results within the expected time';
                                message = message + '\n' + 'Filenames :';

                                for (var i = 0; i < flights.length; i++) {
                                    message = message + '\n' + flights[i].dataValues.filename;

                                    flights[i].update({
                                        data: { "status": 6 },
                                        updatedAt: moment().toDate(),
                                    }).catch(error => {
                                        console.log(error);
                                    });
                                }

                                console.log('Message for Email =');
                                console.log(message);

                                var toList;
                                if (process.env.NODE_ENV == 'production') {
                                    toList = 'philipp.koehler@lht.dlh.de,santhoshakaroti.rajashekar@altran.com,saeed.ahmed@altran.com,adnan.abdulhai@altran.com';
                                } else if (process.env.NODE_ENV == 'test') {
                                    toList = 'santhoshakaroti.rajashekar@altran.com, saeed.ahmed@altran.com';
                                }

                                if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'test') {
                                    sendMailer.mailer.send('email', {
                                        to: toList,
                                        subject: 'There is some problems in the data processing',
                                        pretty: true,
                                        otherProperty: message
                                    }, function(err) {

                                        if (err) {
                                            console.log(err);
                                            console.log('There was an error sending the email');
                                        }
                                        console.log('Email Sent');
                                    });
                                }

                                res.status(200).send({ c: 1, h: _total - flights.length });

                                console.log('status updated');
                            }
                        }).catch(error => {
                            console.log(error);
                            res.status(200).send({ c: 1, h: 0 });
                        });
                } else {
                    responseFn();
                }
            })
            .catch(error => {
                console.log(error);
                res.status(200).send({ c: 1, h: 0 });
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

    getArchivedFilename(req, res) {

        var date = moment().subtract(30, 'days').toDate();
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

        flights.destroy({
            where: {
                is_archived: true,
                updatedAt: {
                    [Op.lt]: moment().subtract(30, 'days').toDate(),
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

    deleteArchivedFlights(req, res) {

        flights.destroy({
            where: {
                is_archived: true,
                createdAt: {
                    [Op.lt]: moment().subtract(30, 'days').toDate(),
                }
            }
        }).then( flights => {
            res.status(200).send('deleted successfully');
        }).catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
    }
}