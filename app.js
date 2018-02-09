const express = require('express');
const mailer = require('express-mailer');
var path = require("path");
const logger = require('morgan');
const bodyParser = require('body-parser');
const debug = require('debug')('expressdebug:server');
const env = process.env.NODE_ENV || 'development';
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/static', express.static(path.join(__dirname, 'docs')))

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS,GET,PUT,HEAD,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    if (env === 'development') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.setHeader('Access-Control-Allow-Credentials', true);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    next();
});

// Require our routes into the application.
require('./server/routes')(app);
app.get('*', (req, res) => res.status(200).send({
    message: 'Welcome to the beginning of nothingness.',
}));

module.exports = app;