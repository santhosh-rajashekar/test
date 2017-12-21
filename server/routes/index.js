const flightController = require('../controllers').flights;
const analyticsController = require('../controllers').analytics;
const uavController = require('../controllers').uav;
const uavhistoryController = require('../controllers').uavhistory;
const partnumberController = require('../controllers').partnumber;
const env = process.env.NODE_ENV || 'development';
const urlPrefix = '';

module.exports = (app) => {
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

    app.get('/api', (req, res) => res.status(200).send({
        message: 'Welcome to the Todos API!',
    }));


    app.post(urlPrefix + '/api/flight', flightController.create);
    app.post(urlPrefix + '/api/flights', flightController.list);

    /**
     * @api {post} /api/flight/:id archive flight analysis
     * @apiName archive flight analysis
     * @apiGroup Flight
     * @apiExample Example usage:
     * curl -i http://0.0.0.0:3000/api/flight/:id
     *
     * @apiSuccess {json} archived flight.
     */
    app.post(urlPrefix + '/api/flight/:id', flightController.archivedFlight);

    app.post(urlPrefix + '/api/get-cockpit-summary', flightController.getCockpitSummary);
    app.post(urlPrefix + '/api/fileupload', flightController.fileupload);
    app.post(urlPrefix + '/api/flight/:id/component-confirmation', flightController.componentConfirmation);
    app.get(urlPrefix + '/api/flights/check-changes/:hash', flightController.checkFlightsChanges);
    app.get(urlPrefix + '/api/flights/get-archived-filename', flightController.getArchivedFilename);
    app.get(urlPrefix + '/api/flights/get-archived-flightdetails', flightController.getArchivedFileDetails);
    app.get(urlPrefix + '/api/flights/remove-archived-flightdetails', flightController.deleteArchivedFlights);
    app.post(urlPrefix + '/api/flights/is-duplicate-file/:id', flightController.isDuplicateFile);
    app.post(urlPrefix + '/api/flights/getFlightsCountAndLastUpdatedById', flightController.getFlightsCountAndLastUpdatedById);
    app.post(urlPrefix + '/api/flights/getFlightsStatusById', flightController.getFlightsStatusById);

    app.post(urlPrefix + '/api/statuscheckfileupload/:filename', flightController.componentCheckedStatusFileUpload);

    app.post(urlPrefix + '/api/datauavs/create', uavController.create);
    app.get(urlPrefix + '/api/datauavs', uavController.list);
    app.post(urlPrefix + '/api/datauavs/get-component', uavController.listById);
    app.post(urlPrefix + '/api/datauavs/:id/history', uavController.update);
    app.post(urlPrefix + '/api/create-serial-number', uavController.createSerialNumber);
    app.get(urlPrefix + '/api/datauavs/delete/:id', uavController.delete);

    /**
     * @api {post} /api/partnumber Create partnumber entry
     * @apiName Create partnumber
     * @apiGroup Partnumber
     * @apiExample Example usage:
     * curl -i http://0.0.0.0:3000/api/partnumbers
     *
     * @apiSuccess {json} partnumbers.
     */
    app.post(urlPrefix + '/api/partnumber', partnumberController.create);

    /**
     * @api {get} /api/partnumbers Get All partnumbers
     * @apiName GetPartnumbers
     * @apiGroup Partnumber
     * @apiExample Example usage:
     * curl -i http://0.0.0.0:3000/api/partnumbers
     *
     * @apiSuccess {json} partnumbers.
     */
    app.get(urlPrefix + '/api/partnumbers', partnumberController.list);
    app.post(urlPrefix + '/api/create-components', partnumberController.createDefaultUavDataComponent);



    app.get(urlPrefix + '/api/analytics/getTotalFlightHoursBySN/:serial_number', analyticsController.getTotalFlightHoursBySN);
    app.get(urlPrefix + '/api/analytics/getAllFlightLocationsBySN/:serial_number', analyticsController.getAllFlightLocationsBySN);
    app.get(urlPrefix + '/api/analytics/getTotalFlightHoursAndCycleyByPN/:part_number', analyticsController.getTotalFlightHoursByPN);
    app.get(urlPrefix + '/api/analytics/getTotalFlightHoursAndCycleyByPN/:part_number/:position', analyticsController.getTotalFlightHoursAndCycleyByPNPOS);
    app.get(urlPrefix + '/api/analytics/getReasonsForComponentUpdateForAllUAVs', analyticsController.getReasonsForComponentUpdateForAllUAVs);
    app.get(urlPrefix + '/api/analytics/getReasonsForComponentUpdateByUAVID/:uav_id', analyticsController.getReasonsForComponentUpdateByUAVID);
    app.get(urlPrefix + '/api/analytics/getReasonsForComponentUpdateByMM/:manufacturer/:model', analyticsController.getReasonsForComponentUpdateByMM);
    app.get(urlPrefix + '/api/analytics/getReasonsForComponentUpdateByPN/:part_number', analyticsController.getReasonsForComponentUpdateByPN);
    app.get(urlPrefix + '/api/analytics/getAnalysisResultsBySN/:serial_number', analyticsController.getAnalysisResultsBySN);
};