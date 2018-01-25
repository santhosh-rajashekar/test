"use strict";

const express = require('express');
const mailer = require('express-mailer');

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

module.exports = {

    notifyViaEmail(message) {

        return new Promise((resolve, reject) => {

            var result = { 'notified': true, 'message': '' };

            var toList;
            if (process.env.NODE_ENV == 'production') {
                toList = 'philipp.koehler@lht.dlh.de,santhoshakaroti.rajashekar@altran.com,saeed.ahmed@altran.com,adnan.abdulhai@altran.com,ali.boushehri@altran.com,shaheer.kollathodi@altran.com';
            } else if (process.env.NODE_ENV == 'test') {
                // toList = 'santhoshakaroti.rajashekar@altran.com, saeed.ahmed@altran.com,ali.boushehri@altran.com,shaheer.kollathodi@altran.com';
                toList = 'santhoshakaroti.rajashekar@altran.com';
            }

            if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'test') {
                sendMailer.mailer.send('email', {
                    to: toList,
                    subject: 'There are some problems in data processing',
                    pretty: true,
                    otherProperty: message
                }, function(err) {
                    if (err) {
                        console.log(err);
                        console.log('But; There was an error sending the email');
                        result.status = false;
                        result.message = err;
                        reject(result);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    }
}