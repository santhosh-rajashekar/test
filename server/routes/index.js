const flightController = require('../controllers').flights;
const uavController = require('../controllers').uav;
const uavhistoryController = require('../controllers').uavhistory;
const partnumberController = require('../controllers').partnumber;
const env = process.env.NODE_ENV || 'development';
const urlPrefix = '';

module.exports = (app) => {
  app.use(function (req, res, next) {
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

  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));

  app.post(urlPrefix + '/api/flight', flightController.create);
  app.post(urlPrefix + '/api/flights', flightController.list);
  app.post(urlPrefix + '/api/flight/status', flightController.getStatus);
  app.post(urlPrefix + '/api/fileupload/:uavid/:batteryIndex/:supportedDrone/:manufacturer/:model', flightController.fileupload);
  app.post(urlPrefix + '/api/flight/component-confirmation', flightController.componentConfirmation);
  app.get(urlPrefix + '/api/flights/check-changes/:hash', flightController.checkFlightsChanges);
  
  app.post(urlPrefix + '/api/datauavs', uavController.create);
  app.get(urlPrefix + '/api/datauavs', uavController.list);
  app.post(urlPrefix + '/api/datauavs/get-component', uavController.listById);
  app.post(urlPrefix + '/api/datauavs/:id/history', uavController.update);
  app.post(urlPrefix + '/api/create-serial-number', uavController.createSerialNumber);
  app.get(urlPrefix + '/api/datauavs/delete/:id', uavController.delete);

  app.post(urlPrefix + '/api/partnumber', partnumberController.create);
  app.get(urlPrefix + '/api/partnumbers', partnumberController.list);
  app.post(urlPrefix + '/api/create-components', partnumberController.createDefaultUavDataComponent);
};