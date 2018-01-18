'use strict';
var io = require('socket.io')();
var clients = [];
// var timerId = null;
var sockets = new Set();

module.exports = {

    initializeSocket() {

        io.on('connection', socket => {

            console.log(`Socket ${socket.id} added`);
            sockets.add(socket);

            // if (!timerId) {
            //     startTimer();
            // }

            socket.on('storeClientInfo', (data) => {

                console.log(`storeClientInfo called: ${data.user_id}`);

                var clientInfo = new Object();
                clientInfo.user_id = data.user_id;
                clientInfo.uav_id = data.uav_id;
                clientInfo.flight_id = data.flight_id;
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

            // function startTimer() {
            //     //Simulate stock data received by the server that needs 
            //     //to be pushed to clients
            //     timerId = setInterval(() => {
            //         if (!sockets.size) {
            //             clearInterval(timerId);
            //             timerId = null;
            //             console.log(`Timer stopped`);
            //         }
            //         let value = ((Math.random() * 50) + 1).toFixed(2);
            //         //See comment above about using a "room" to emit to an entire
            //         //group of sockets if appropriate for your scenario
            //         //This example tracks each socket and emits to each one
            //         for (const s of sockets) {
            //             console.log(`Emitting value: ${value}`);
            //             s.emit('progress', { data: value });
            //         }

            //     }, 1000);
            // }
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

        var clientToNotify = null;

        if (!user_id || !uav_id || !flight_id || !progress || !process_state || !title) {
            res.status(500).send('Missing mandatory parameters (user_id, uav_id, flight_id, progress, process_state, title)');
        }

        for (var i = 0, len = clients.length; i < len; ++i) {
            var c = clients[i];

            // if (c.user_id == user_id && c.uav_id == uav_id && c.flight_id == flight_id) {
            //     clientToNotify = c;
            //     break;
            // }

            if (c.user_id == user_id) {
                clientToNotify = c;
                break;
            }
        }

        if (clientToNotify) {
            for (const socket of sockets) {

                if (socket.id == clientToNotify.socket_id) {
                    socket.emit('progress', req.body);
                    res.status(200).send('ok');
                    break;
                }
            }
        } else {
            res.status(500).send('nok, client not found to receive the progress status');
        }

    }
}