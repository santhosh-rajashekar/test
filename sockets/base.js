'use strict';
var io = require('socket.io')();
const flights = require('../server/models').flights;
const notificationController = require('../server/controllers/notifier');
var clients = [];
var sockets = new Set();

var notifyClient = function(req, res, flight_id, uav_id, user_id, updateFlight) {

    if (updateFlight) {
        //Note : whether the client still exist to receive the notification or not, save the state received
        updateProgressedStateInFlight(req, res, flight_id);
    }

    var clientsToNotify = getClientsToNotify(user_id);
    var socketsToNotify = getSockets(clientsToNotify);

    if (socketsToNotify && socketsToNotify.length > 0) {
        for (let i = 0; i < socketsToNotify.length; i++) {
            console.log('socketsToNotify called for ' + socketsToNotify[i].id);
            socketsToNotify[i].emit('progress', req.body);
        }
        res.status(200).send('ok');
    } else {
        res.status(500).send('nok, client not found to receive the progress status');
    }
};

var notifyOtherClients = function(req, res, flight_id, uav_id, user_id) {

    flights.findAll({
            attributes: ['user_id'],
            where: {
                id: flight_id,
                uav_id: uav_id
            }
        })
        .then(flights => {
            if (flights && flights.length > 0) {
                for (let i = 0; i < flights.length; i++) {

                    if (user_id != flights[0].user_id) {
                        var userid = flights[0].user_id;
                        notifyClient(req, res, flight_id, uav_id, userid, false);
                    }
                }
            }
        }).catch(error => {
            console.log('Error while notifying the other clients ' + error);
        });
};

var updateProgressedStateInFlight = function(req, res, flight_id) {

    //remove the redundancy (user_id, uav_id, flight_id)
    //TODO : update / notify via emial / monitoring system when there is any error scenarios
    var state_received = req.body;
    var value = {
        "module_name": state_received.module_name,
        "title": state_received.title,
        "progress": state_received.progress,
        "progress_state": state_received.process_state,
    };

    if (state_received.error) {
        value.error = state_received.error;
    }

    flights.findById(flight_id)
        .then(flight => {
            try {
                if (!flight) {
                    console.log('No flight found with the flight id ' + flight_id + ' to update the progress state');
                    return;
                }

                flight.update({
                        processed_state: value
                    })
                    .then(flight => {
                        console.log('Updated the progress_state for the flight_id ' + flight_id);
                    })
                    .catch(error => {
                        console.log('Error while updateding the progress_state for the flight_id' + flight_id + ' Error ' + error);
                    });
            } catch (error) {
                console.log(error);
                res.status(500).send(error);
            }
        })
        .catch(error => {
            console.log('Error while updateding the progress_state for the flight_id' + flight_id + ' Error ' + error);
        });
};

var getClientsToNotify = function(user_id) {

    var clientsToNotify = [];

    for (var i = 0, len = clients.length; i < len; ++i) {
        var c = clients[i];

        if (c.user_id == user_id) {
            clientsToNotify.push(c);
        }
    }
    return clientsToNotify;
};

var getSockets = function(clientsToNotify) {

    var socketsToNotify = [];

    if (clientsToNotify && clientsToNotify.length > 0) {
        for (let i = 0; i < clientsToNotify.length; i++) {
            for (const socket of sockets) {
                if (socket.id == clientsToNotify[i].socket_id) {
                    socketsToNotify.push(socket);
                }
            }
        }
    }

    return socketsToNotify;
};

var prepareMessage = function(response) {

    var module_name = response.module_name;
    var title = response.title;
    var description = response.description;
    var user_id = response.user_id;
    var uav_id = response.uav_id;
    var flight_id = response.flight_id;
    var progress = response.progress;
    var process_state = response.process_state;
    var error = response.error;

    var message = "There is an error in processing the below fligt log \n \
    FlightId : " + flight_id + "\nUser Id : " + user_id + "\nUAV Id : " + uav_id + "\nModule Where Error Occured : " + module_name + "\
    \nError : " + error.message + "\nError code : " + error.code + "";

    return message;
};

var notifyErrorViaEmail = function(req, res) {
    var message = prepareMessage(req.body);
    notificationController.notifyViaEmail(message).then(result => {
        if (result && result.notified) {
            console.log('Email sent successfully of the error state and progress will be notified.');
        }
    }).catch(result => {
        //TODO : push to monitoring and log file, attention to be paid here
        console.log('Sending email failed.');
    });
};

var saveFailedStateInDatabase = function(req, res) {

    //TODO : push to monitoring and log file, attention to be paid here
    //This method is not returning anything, error scenarios are just consoled at the moment
    var flight_id = req.body.flight_id;
    var error = req.body.error;
    var dataToUpdate = { "status": error.code };

    flights.findById(flight_id)
        .then(flight => {
            if (!flight) {
                var message = 'NOK, No flight found with flight id' + flight_id + ' to update the error state';
                return;
            }

            flight.data = dataToUpdate;
            flight.update({
                    data: flight.data,
                })
                .then(flight => {
                    console.log('Error state successfully updated in flights table for flight id ' + flight.id);
                })
                .catch(error => {
                    console.log(error);
                });
        }).catch(error => {
            console.log(error);
        });
};

module.exports = {

    initializeSocket() {

        io.on('connection', socket => {

            console.log(`Socket ${socket.id} added`);
            sockets.add(socket);

            socket.on('storeClientInfo', (data) => {

                console.log(`storeClientInfo called: ${data.user_id}`);

                var clientInfo = new Object();
                clientInfo.user_id = data.user_id;
                clientInfo.socket_id = socket.id;
                clients.push(clientInfo);
            });

            socket.on('disconnect', () => {
                console.log(`Deleting socket: ${socket.id}`);

                for (var i = 0, len = clients.length; i < len; ++i) {
                    var c = clients[i];

                    if (c.socket_id == socket.id) {
                        clients.splice(i, 1);
                        break;
                    }
                }
                console.log(`Remaining sockets: ${clients.length}`);
            });
        });

        return io;
    },

    notifyProgress(req, res) {

        var module_name = req.body.module_name;
        var title = req.body.title;
        var description = req.body.description;
        var user_id = req.body.user_id;
        var uav_id = req.body.uav_id;
        var flight_id = req.body.flight_id;
        var progress = req.body.progress;
        var process_state = req.body.process_state;

        if (!flight_id || !process_state || !title || progress == null) {
            res.status(500).send('Missing mandatory parameters (flight_id, progress, process_state, title)');
        }

        if (progress < 0 || progress > 100) {
            res.status(500).send('Invalid value for the progress parameter, value should be between 0 and 100');
        }

        if (process_state == 'failed') {

            var error = req.body.error;
            if (!error) {
                res.status(500).send('Invalid arguments, error attribute is mandatory when process state is failed');
            }

            var code = error.code;
            var errorMessage = error.message;
            if (!code && !errorMessage) {
                res.status(500).send('Invalid arguments, error field should have code and message attributes when process state is failed');
            } else {
                notifyErrorViaEmail(req, res);
                saveFailedStateInDatabase(req, res);
            }
        }

        if (user_id && uav_id) {
            //best case scenario, progress is notified with all the required info
            notifyClient(req, res, flight_id, uav_id, user_id, true);
            notifyOtherClients(req, res, flight_id, uav_id, user_id);
        } else {
            //not so good scenario, progress is notified but not enough information to track and inform the right client
            flights.findAll({
                    attributes: ['id', 'user_id', 'uav_id'],
                    where: {
                        id: flight_id
                    }
                })
                .then(flights => {
                    if (flights && flights.length < 1) {
                        var message = 'NOK, No flight found with flight id' + flight_id;
                        return res.status(200).send(message);
                    } else if (flights.length == 1) {
                        var user_id = flights[0].user_id;
                        var uav_id = flights[0].uav_id;
                        notifyClient(req, res, flight_id, uav_id, user_id, true);
                        notifyOtherClients(req, res, flight_id, uav_id, user_id);
                    }
                }).catch(error => {
                    return res.status(200).send(error);
                });
        }
    }
}