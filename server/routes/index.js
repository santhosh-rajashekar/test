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


    // app.post(urlPrefix + '/api/flight', flightController.create);

    /**
     * @api {post} /api/flights Get all flights details by uav ids
     * @apiName Get all flights details by uav ids
     * @apiGroup Flight
     * @apiHeaderExample {json} Header-Example:
     *     {
     *       Content-Type:application/json
     *     }
     * @apiParam {array} ids unique IDs.
     * @apiParamExample {json} Request-Example:
     * {
     * "ids": [
     * "2742"
     * ]
     * }
     * @apiSuccess {array} flights details by uav_id.
     * @apiSuccessExample {json} Success-Response:
     * [
    {
        "id": 117,
        "uav_id": 2742,
        "metadata": {
            "fcs": [
                {
                    "FC_PN": 5,
                    "model": "PX4",
                    "FC_CPU": "",
                    "FC_FSCM": "",
                    "part_no": "5",
                    "FC_Model": "PX4",
                    "FC_PN_Comment": "YUNEEC H520",
                    "FC_Partnumber": "YH520-PX4",
                    "serial_number": "C-FNW-7KL",
                    "FC_ACC_Sensor1": "",
                    "FC_ACC_Sensor2": "",
                    "FC_ACC_Sensor3": "",
                    "FC_GYR_Sensor1": "",
                    "FC_GYR_Sensor2": "",
                    "FC_GYR_Sensor3": "",
                    "FC_Manufacturer": "YUNEEC"
                }
            ],
            "UAV_PN": 6,
            "uav_id": 2742,
            "battery": {
                "part_no": "5",
                "serial_number": "C-BSG-MOA"
            },
            "part_no": "6",
            "HCM_Flag": "y",
            "UAV_ESC1": 5,
            "UAV_ESC2": 5,
            "UAV_ESC3": 5,
            "UAV_ESC4": 5,
            "UAV_ESC5": 5,
            "UAV_ESC6": 5,
            "UAV_ESC7": null,
            "UAV_ESC8": null,
            "UAV_BLDC1": 5,
            "UAV_BLDC2": 5,
            "UAV_BLDC3": 5,
            "UAV_BLDC4": 5,
            "UAV_BLDC5": 5,
            "UAV_BLDC6": 5,
            "UAV_BLDC7": null,
            "UAV_BLDC8": null,
            "UAV_MGTOW": "",
            "UAV_Model": "H520",
            "batteries": [
                {
                    "note": "YUNEEC H520",
                    "model": "Power4",
                    "BAT_PN": 5,
                    "part_no": "5",
                    "BAT_FSCM": "",
                    "BAT_Type": "LiPo",
                    "BAT_Model": "Power4",
                    "BAT_Capacity": 5.25,
                    "BAT_Chemistry": null,
                    "BAT_WireGauge": null,
                    "serial_number": "C-BSG-MOA",
                    "BAT_PN_Comment": "YUNEEC H520",
                    "BAT_Partnumber": "YH520-5250-4S1P",
                    "BAT_Cell_series": 4,
                    "BAT_Voltage_max": "17,40",
                    "BAT_Voltage_min": "13,20",
                    "BAT_Voltage_nom": "14,80",
                    "BAT_Manufacturer": "GREPOW",
                    "BAT_Voltage_safe": "14,00",
                    "BAT_Cell_parallel": 1,
                    "BAT_ConnectorType": null,
                    "BAT_ChargeRate_cont": 5,
                    "BAT_Temperature_max": 60,
                    "BAT_Temperature_min": 0,
                    "BAT_Cell_voltage_max": "4,35",
                    "BAT_Cell_voltage_min": "3,30",
                    "BAT_Cell_voltage_nom": "3,70",
                    "BAT_ChargeRate_burst": 10,
                    "BAT_Cell_voltage_safe": "3,50",
                    "BAT_DischargeRate_cont": 68,
                    "BAT_Internal_Impedance": null,
                    "BAT_DischargeRate_burst": 70,
                    "BAT_DischargeRate_cont_time": 3,
                    "BAT_DischargeRate_burst_time": 3
                }
            ],
            "UAV_Market": "Commercial",
            "UAV_Status": "active",
            "components": [
                {
                    "esc": {
                        "model": "Yuneec_esc_foc",
                        "ESC_PN": 5,
                        "ESC_BEC": "No",
                        "part_no": "5",
                        "ESC_FSCM": "",
                        "ESC_Model": "Yuneec_esc_foc",
                        "ESC_PWM_max": 20,
                        "ESC_RPM_max": 7.5,
                        "ESC_Firmware": 1.15,
                        "ESC_Nom_time": null,
                        "ESC_Cells_max": 4,
                        "ESC_Cells_min": 4,
                        "ESC_IP_Rating": null,
                        "ESC_Power_nom": null,
                        "serial_number": "C-EE8-B1A",
                        "ESC_Burst_time": null,
                        "ESC_PN_Comment": "YUNEEC H520",
                        "ESC_PWM_normal": 250,
                        "ESC_Partnumber": "YH520-8",
                        "ESC_Current_nom": 8,
                        "ESC_Power_burst": null,
                        "ESC_Voltage_max": "17,40",
                        "ESC_Voltage_min": "14,80",
                        "ESC_Battery_type": "LiPo",
                        "ESC_Manufacturer": "YUNEEC",
                        "ESC_Current_burst": 11,
                        "ESC_Active_Braking": "No",
                        "ESC_Temperature_max": "40,00",
                        "ESC_Temperature_min": "-10,00"
                    },
                    "bldc": {
                        "model": "BL3210-31 KV730",
                        "BLDC_PN": 5,
                        "part_no": "5",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": null,
                        "BLDC_Model": "BL3210-31 KV730",
                        "BLDC_Poles": 14,
                        "BLDC_Bearing": "NMB",
                        "BLDC_Grooves": 12,
                        "BLDC_RPM_max": 7.834,
                        "BLDC_Nom_time": null,
                        "BLDC_kMRating": "0,0143",
                        "BLDC_kTRating": "0,0129",
                        "BLDC_kVRating": 730,
                        "serial_number": "C-MDF-TL3",
                        "BLDC_Cells_max": 4,
                        "BLDC_Cells_min": 2,
                        "BLDC_IP_Rating": null,
                        "BLDC_Power_nom": 138,
                        "BLDC_Burst_time": null,
                        "BLDC_PN_Comment": "YUNEEC H520",
                        "BLDC_Partnumber": "BL3210 _31 _730",
                        "BLDC_Current_nom": 13,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": null,
                        "BLDC_Voltage_max": "15,20",
                        "BLDC_Voltage_min": "7,60",
                        "BLDC_Manufacturer": "YUNEEC",
                        "BLDC_Current_burst": null,
                        "BLDC_Temperature_max": null,
                        "BLDC_Temperature_min": null,
                        "BLDC_InternalResistance": 142
                    },
                    "prop": {
                        "model": "Y-H520 9.8x6,8",
                        "PROP_PN": 5,
                        "part_no": "5",
                        "PROP_FSCM": "",
                        "PROP_Model": "Y-H520 9.8x6,8",
                        "PROP_Pitch": "6,8",
                        "PROP_RPM_max": 7.835,
                        "PROP_Diameter": "9,8",
                        "PROP_Material": "XCF12",
                        "serial_number": "C-PWA-DTE",
                        "PROP_PN_Comment": "YUNEEC H520",
                        "PROP_Partnumber": "YH520_98_68",
                        "PROP_Manufacturer": "YUNEEC"
                    }
                },
                {
                    "esc": {
                        "model": "Yuneec_esc_foc",
                        "ESC_PN": 5,
                        "ESC_BEC": "No",
                        "part_no": "5",
                        "ESC_FSCM": "",
                        "ESC_Model": "Yuneec_esc_foc",
                        "ESC_PWM_max": 20,
                        "ESC_RPM_max": 7.5,
                        "ESC_Firmware": 1.15,
                        "ESC_Nom_time": null,
                        "ESC_Cells_max": 4,
                        "ESC_Cells_min": 4,
                        "ESC_IP_Rating": null,
                        "ESC_Power_nom": null,
                        "serial_number": "C-EE1-58N",
                        "ESC_Burst_time": null,
                        "ESC_PN_Comment": "YUNEEC H520",
                        "ESC_PWM_normal": 250,
                        "ESC_Partnumber": "YH520-8",
                        "ESC_Current_nom": 8,
                        "ESC_Power_burst": null,
                        "ESC_Voltage_max": "17,40",
                        "ESC_Voltage_min": "14,80",
                        "ESC_Battery_type": "LiPo",
                        "ESC_Manufacturer": "YUNEEC",
                        "ESC_Current_burst": 11,
                        "ESC_Active_Braking": "No",
                        "ESC_Temperature_max": "40,00",
                        "ESC_Temperature_min": "-10,00"
                    },
                    "bldc": {
                        "model": "BL3210-31 KV730",
                        "BLDC_PN": 5,
                        "part_no": "5",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": null,
                        "BLDC_Model": "BL3210-31 KV730",
                        "BLDC_Poles": 14,
                        "BLDC_Bearing": "NMB",
                        "BLDC_Grooves": 12,
                        "BLDC_RPM_max": 7.834,
                        "BLDC_Nom_time": null,
                        "BLDC_kMRating": "0,0143",
                        "BLDC_kTRating": "0,0129",
                        "BLDC_kVRating": 730,
                        "serial_number": "C-MY8-ZWS",
                        "BLDC_Cells_max": 4,
                        "BLDC_Cells_min": 2,
                        "BLDC_IP_Rating": null,
                        "BLDC_Power_nom": 138,
                        "BLDC_Burst_time": null,
                        "BLDC_PN_Comment": "YUNEEC H520",
                        "BLDC_Partnumber": "BL3210 _31 _730",
                        "BLDC_Current_nom": 13,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": null,
                        "BLDC_Voltage_max": "15,20",
                        "BLDC_Voltage_min": "7,60",
                        "BLDC_Manufacturer": "YUNEEC",
                        "BLDC_Current_burst": null,
                        "BLDC_Temperature_max": null,
                        "BLDC_Temperature_min": null,
                        "BLDC_InternalResistance": 142
                    },
                    "prop": {
                        "model": "Y-H520 9.8x6,8",
                        "PROP_PN": 5,
                        "part_no": "5",
                        "PROP_FSCM": "",
                        "PROP_Model": "Y-H520 9.8x6,8",
                        "PROP_Pitch": "6,8",
                        "PROP_RPM_max": 7.835,
                        "PROP_Diameter": "9,8",
                        "PROP_Material": "XCF12",
                        "serial_number": "C-P96-9JJ",
                        "PROP_PN_Comment": "YUNEEC H520",
                        "PROP_Partnumber": "YH520_98_68",
                        "PROP_Manufacturer": "YUNEEC"
                    }
                },
                {
                    "esc": {
                        "model": "Yuneec_esc_foc",
                        "ESC_PN": 5,
                        "ESC_BEC": "No",
                        "part_no": "5",
                        "ESC_FSCM": "",
                        "ESC_Model": "Yuneec_esc_foc",
                        "ESC_PWM_max": 20,
                        "ESC_RPM_max": 7.5,
                        "ESC_Firmware": 1.15,
                        "ESC_Nom_time": null,
                        "ESC_Cells_max": 4,
                        "ESC_Cells_min": 4,
                        "ESC_IP_Rating": null,
                        "ESC_Power_nom": null,
                        "serial_number": "C-EJQ-BS3",
                        "ESC_Burst_time": null,
                        "ESC_PN_Comment": "YUNEEC H520",
                        "ESC_PWM_normal": 250,
                        "ESC_Partnumber": "YH520-8",
                        "ESC_Current_nom": 8,
                        "ESC_Power_burst": null,
                        "ESC_Voltage_max": "17,40",
                        "ESC_Voltage_min": "14,80",
                        "ESC_Battery_type": "LiPo",
                        "ESC_Manufacturer": "YUNEEC",
                        "ESC_Current_burst": 11,
                        "ESC_Active_Braking": "No",
                        "ESC_Temperature_max": "40,00",
                        "ESC_Temperature_min": "-10,00"
                    },
                    "bldc": {
                        "model": "BL3210-31 KV730",
                        "BLDC_PN": 5,
                        "part_no": "5",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": null,
                        "BLDC_Model": "BL3210-31 KV730",
                        "BLDC_Poles": 14,
                        "BLDC_Bearing": "NMB",
                        "BLDC_Grooves": 12,
                        "BLDC_RPM_max": 7.834,
                        "BLDC_Nom_time": null,
                        "BLDC_kMRating": "0,0143",
                        "BLDC_kTRating": "0,0129",
                        "BLDC_kVRating": 730,
                        "serial_number": "C-MX2-20F",
                        "BLDC_Cells_max": 4,
                        "BLDC_Cells_min": 2,
                        "BLDC_IP_Rating": null,
                        "BLDC_Power_nom": 138,
                        "BLDC_Burst_time": null,
                        "BLDC_PN_Comment": "YUNEEC H520",
                        "BLDC_Partnumber": "BL3210 _31 _730",
                        "BLDC_Current_nom": 13,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": null,
                        "BLDC_Voltage_max": "15,20",
                        "BLDC_Voltage_min": "7,60",
                        "BLDC_Manufacturer": "YUNEEC",
                        "BLDC_Current_burst": null,
                        "BLDC_Temperature_max": null,
                        "BLDC_Temperature_min": null,
                        "BLDC_InternalResistance": 142
                    },
                    "prop": {
                        "model": "Y-H520 9.8x6,8",
                        "PROP_PN": 5,
                        "part_no": "5",
                        "PROP_FSCM": "",
                        "PROP_Model": "Y-H520 9.8x6,8",
                        "PROP_Pitch": "6,8",
                        "PROP_RPM_max": 7.835,
                        "PROP_Diameter": "9,8",
                        "PROP_Material": "XCF12",
                        "serial_number": "C-P08-LY8",
                        "PROP_PN_Comment": "YUNEEC H520",
                        "PROP_Partnumber": "YH520_98_68",
                        "PROP_Manufacturer": "YUNEEC"
                    }
                },
                {
                    "esc": {
                        "model": "Yuneec_esc_foc",
                        "ESC_PN": 5,
                        "ESC_BEC": "No",
                        "part_no": "5",
                        "ESC_FSCM": "",
                        "ESC_Model": "Yuneec_esc_foc",
                        "ESC_PWM_max": 20,
                        "ESC_RPM_max": 7.5,
                        "ESC_Firmware": 1.15,
                        "ESC_Nom_time": null,
                        "ESC_Cells_max": 4,
                        "ESC_Cells_min": 4,
                        "ESC_IP_Rating": null,
                        "ESC_Power_nom": null,
                        "serial_number": "C-EQY-G9D",
                        "ESC_Burst_time": null,
                        "ESC_PN_Comment": "YUNEEC H520",
                        "ESC_PWM_normal": 250,
                        "ESC_Partnumber": "YH520-8",
                        "ESC_Current_nom": 8,
                        "ESC_Power_burst": null,
                        "ESC_Voltage_max": "17,40",
                        "ESC_Voltage_min": "14,80",
                        "ESC_Battery_type": "LiPo",
                        "ESC_Manufacturer": "YUNEEC",
                        "ESC_Current_burst": 11,
                        "ESC_Active_Braking": "No",
                        "ESC_Temperature_max": "40,00",
                        "ESC_Temperature_min": "-10,00"
                    },
                    "bldc": {
                        "model": "BL3210-31 KV730",
                        "BLDC_PN": 5,
                        "part_no": "5",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": null,
                        "BLDC_Model": "BL3210-31 KV730",
                        "BLDC_Poles": 14,
                        "BLDC_Bearing": "NMB",
                        "BLDC_Grooves": 12,
                        "BLDC_RPM_max": 7.834,
                        "BLDC_Nom_time": null,
                        "BLDC_kMRating": "0,0143",
                        "BLDC_kTRating": "0,0129",
                        "BLDC_kVRating": 730,
                        "serial_number": "C-MGP-G4A",
                        "BLDC_Cells_max": 4,
                        "BLDC_Cells_min": 2,
                        "BLDC_IP_Rating": null,
                        "BLDC_Power_nom": 138,
                        "BLDC_Burst_time": null,
                        "BLDC_PN_Comment": "YUNEEC H520",
                        "BLDC_Partnumber": "BL3210 _31 _730",
                        "BLDC_Current_nom": 13,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": null,
                        "BLDC_Voltage_max": "15,20",
                        "BLDC_Voltage_min": "7,60",
                        "BLDC_Manufacturer": "YUNEEC",
                        "BLDC_Current_burst": null,
                        "BLDC_Temperature_max": null,
                        "BLDC_Temperature_min": null,
                        "BLDC_InternalResistance": 142
                    },
                    "prop": {
                        "model": "Y-H520 9.8x6,8",
                        "PROP_PN": 5,
                        "part_no": "5",
                        "PROP_FSCM": "",
                        "PROP_Model": "Y-H520 9.8x6,8",
                        "PROP_Pitch": "6,8",
                        "PROP_RPM_max": 7.835,
                        "PROP_Diameter": "9,8",
                        "PROP_Material": "XCF12",
                        "serial_number": "C-P15-R3H",
                        "PROP_PN_Comment": "YUNEEC H520",
                        "PROP_Partnumber": "YH520_98_68",
                        "PROP_Manufacturer": "YUNEEC"
                    }
                },
                {
                    "esc": {
                        "model": "Yuneec_esc_foc",
                        "ESC_PN": 5,
                        "ESC_BEC": "No",
                        "part_no": "5",
                        "ESC_FSCM": "",
                        "ESC_Model": "Yuneec_esc_foc",
                        "ESC_PWM_max": 20,
                        "ESC_RPM_max": 7.5,
                        "ESC_Firmware": 1.15,
                        "ESC_Nom_time": null,
                        "ESC_Cells_max": 4,
                        "ESC_Cells_min": 4,
                        "ESC_IP_Rating": null,
                        "ESC_Power_nom": null,
                        "serial_number": "C-ETM-6UF",
                        "ESC_Burst_time": null,
                        "ESC_PN_Comment": "YUNEEC H520",
                        "ESC_PWM_normal": 250,
                        "ESC_Partnumber": "YH520-8",
                        "ESC_Current_nom": 8,
                        "ESC_Power_burst": null,
                        "ESC_Voltage_max": "17,40",
                        "ESC_Voltage_min": "14,80",
                        "ESC_Battery_type": "LiPo",
                        "ESC_Manufacturer": "YUNEEC",
                        "ESC_Current_burst": 11,
                        "ESC_Active_Braking": "No",
                        "ESC_Temperature_max": "40,00",
                        "ESC_Temperature_min": "-10,00"
                    },
                    "bldc": {
                        "model": "BL3210-31 KV730",
                        "BLDC_PN": 5,
                        "part_no": "5",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": null,
                        "BLDC_Model": "BL3210-31 KV730",
                        "BLDC_Poles": 14,
                        "BLDC_Bearing": "NMB",
                        "BLDC_Grooves": 12,
                        "BLDC_RPM_max": 7.834,
                        "BLDC_Nom_time": null,
                        "BLDC_kMRating": "0,0143",
                        "BLDC_kTRating": "0,0129",
                        "BLDC_kVRating": 730,
                        "serial_number": "C-MDJ-XWG",
                        "BLDC_Cells_max": 4,
                        "BLDC_Cells_min": 2,
                        "BLDC_IP_Rating": null,
                        "BLDC_Power_nom": 138,
                        "BLDC_Burst_time": null,
                        "BLDC_PN_Comment": "YUNEEC H520",
                        "BLDC_Partnumber": "BL3210 _31 _730",
                        "BLDC_Current_nom": 13,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": null,
                        "BLDC_Voltage_max": "15,20",
                        "BLDC_Voltage_min": "7,60",
                        "BLDC_Manufacturer": "YUNEEC",
                        "BLDC_Current_burst": null,
                        "BLDC_Temperature_max": null,
                        "BLDC_Temperature_min": null,
                        "BLDC_InternalResistance": 142
                    },
                    "prop": {
                        "model": "Y-H520 9.8x6,8",
                        "PROP_PN": 5,
                        "part_no": "5",
                        "PROP_FSCM": "",
                        "PROP_Model": "Y-H520 9.8x6,8",
                        "PROP_Pitch": "6,8",
                        "PROP_RPM_max": 7.835,
                        "PROP_Diameter": "9,8",
                        "PROP_Material": "XCF12",
                        "serial_number": "C-PN7-4Z1",
                        "PROP_PN_Comment": "YUNEEC H520",
                        "PROP_Partnumber": "YH520_98_68",
                        "PROP_Manufacturer": "YUNEEC"
                    }
                },
                {
                    "esc": {
                        "model": "Yuneec_esc_foc",
                        "ESC_PN": 5,
                        "ESC_BEC": "No",
                        "part_no": "5",
                        "ESC_FSCM": "",
                        "ESC_Model": "Yuneec_esc_foc",
                        "ESC_PWM_max": 20,
                        "ESC_RPM_max": 7.5,
                        "ESC_Firmware": 1.15,
                        "ESC_Nom_time": null,
                        "ESC_Cells_max": 4,
                        "ESC_Cells_min": 4,
                        "ESC_IP_Rating": null,
                        "ESC_Power_nom": null,
                        "serial_number": "C-E3Y-TLR",
                        "ESC_Burst_time": null,
                        "ESC_PN_Comment": "YUNEEC H520",
                        "ESC_PWM_normal": 250,
                        "ESC_Partnumber": "YH520-8",
                        "ESC_Current_nom": 8,
                        "ESC_Power_burst": null,
                        "ESC_Voltage_max": "17,40",
                        "ESC_Voltage_min": "14,80",
                        "ESC_Battery_type": "LiPo",
                        "ESC_Manufacturer": "YUNEEC",
                        "ESC_Current_burst": 11,
                        "ESC_Active_Braking": "No",
                        "ESC_Temperature_max": "40,00",
                        "ESC_Temperature_min": "-10,00"
                    },
                    "bldc": {
                        "model": "BL3210-31 KV730",
                        "BLDC_PN": 5,
                        "part_no": "5",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": null,
                        "BLDC_Model": "BL3210-31 KV730",
                        "BLDC_Poles": 14,
                        "BLDC_Bearing": "NMB",
                        "BLDC_Grooves": 12,
                        "BLDC_RPM_max": 7.834,
                        "BLDC_Nom_time": null,
                        "BLDC_kMRating": "0,0143",
                        "BLDC_kTRating": "0,0129",
                        "BLDC_kVRating": 730,
                        "serial_number": "C-MGT-IEV",
                        "BLDC_Cells_max": 4,
                        "BLDC_Cells_min": 2,
                        "BLDC_IP_Rating": null,
                        "BLDC_Power_nom": 138,
                        "BLDC_Burst_time": null,
                        "BLDC_PN_Comment": "YUNEEC H520",
                        "BLDC_Partnumber": "BL3210 _31 _730",
                        "BLDC_Current_nom": 13,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": null,
                        "BLDC_Voltage_max": "15,20",
                        "BLDC_Voltage_min": "7,60",
                        "BLDC_Manufacturer": "YUNEEC",
                        "BLDC_Current_burst": null,
                        "BLDC_Temperature_max": null,
                        "BLDC_Temperature_min": null,
                        "BLDC_InternalResistance": 142
                    },
                    "prop": {
                        "model": "Y-H520 9.8x6,8",
                        "PROP_PN": 5,
                        "part_no": "5",
                        "PROP_FSCM": "",
                        "PROP_Model": "Y-H520 9.8x6,8",
                        "PROP_Pitch": "6,8",
                        "PROP_RPM_max": 7.835,
                        "PROP_Diameter": "9,8",
                        "PROP_Material": "XCF12",
                        "serial_number": "C-PMX-JE3",
                        "PROP_PN_Comment": "YUNEEC H520",
                        "PROP_Partnumber": "YH520_98_68",
                        "PROP_Manufacturer": "YUNEEC"
                    }
                }
            ],
            "UAV_Version": null,
            "upload_date": "2017-12-15 12:19:20",
            "UAV_Battery1": 5,
            "UAV_Airframe1": "Hexacopter",
            "UAV_Airframe2": "6x1",
            "UAV_PN_Comment": "",
            "UAV_Partnumber": "",
            "UAV_Propeller1": 5,
            "UAV_Propeller2": 5,
            "UAV_Propeller3": 5,
            "UAV_Propeller4": 5,
            "UAV_Propeller5": 5,
            "UAV_Propeller6": 5,
            "UAV_Propeller7": null,
            "UAV_Propeller8": null,
            "UAV_Propulsion": "Electric Motor",
            "UAV_Description": "",
            "upload_filename": "datafile_yuneec_h520_87.bin",
            "UAV_Manufacturer": "YUNEEC",
            "UAV_Launch_method": "VTOL",
            "manufacturer_name": "YUNEEC",
            "UAV_Speed_Vertical": 5,
            "manufacturer_model": "H520",
            "UAV_Development_year": 2017,
            "UAV_Speed_Horizontal": 15,
            "UAV_FlightController1": 5,
            "UAV_FlightController2": null
        },
        "data": {
            "status": 6
        },
        "is_archived": false,
        "filename": "datafile_yuneec_h520_117.bin",
        "file_md5_hash": "57da129cef2a05b4c3d82a4e4b7cef97",
        "filesize": "154750976",
        "user_id": "2622",
        "createdAt": "2017-12-15T12:19:20.761Z",
        "updatedAt": "2017-12-15T12:19:27.000Z"
    }
]
     * @apiExample Example usage:
     * curl -X POST \
       http://localhost:3000/api/flights \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "ids": [
    "2742"
  ]
}'
     */
    app.post(urlPrefix + '/api/flights', flightController.list)
    app.post(urlPrefix + '/api/flight/:id', flightController.archivedFlight);

    app.post(urlPrefix + '/api/get-cockpit-summary', flightController.getCockpitSummary);

    /**
     * @api {post} /api/fileupload Upload a file and create a flight entry
     * @apiName Upload a file and create a flight entry
     * @apiGroup Flight
     * @apiHeaderExample {json} Header-Example:
     *     {
     *       Content-Type:application/json
     *     }
     * @apiParam {array} ids unique IDs.
     * @apiParamExample {json} Request-Example:
     * ------WebKitFormBoundarytKWUdT7aWbOS9zga
Content-Disposition: form-data; name="data"

{"uavid":"2749","batteryIndex":0,"supportedDrone":true,"manufacturer":"Matternet","model":"M2","md5hash":"3a016ed2265ff7d61f118e23b7f93575","filesize":24156847,"user_id":"2622"}
------WebKitFormBoundarytKWUdT7aWbOS9zga
Content-Disposition: form-data; name="file"; filename="datafile_yuneec_h520_40.log"
Content-Type: application/octet-stream


------WebKitFormBoundarytKWUdT7aWbOS9zga--
     * @apiSuccess {array} flights details by uav_id.
     * @apiSuccessExample {json} Success-Response:
     * {"message":"File datafile_yuneec_h520_40.log (datafile_matternet_m2_122.log) was uploaded successfully!"}
     * @apiExample Example usage:
     * curl -X POST \
       http://localhost:3000/api/flights \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "ids": [
    "2742"
  ]
}'
     */
    app.post(urlPrefix + '/api/fileupload', flightController.fileupload);

    app.post(urlPrefix + '/api/flight/:id/component-confirmation', flightController.componentConfirmation);

    app.get(urlPrefix + '/api/flights/check-changes/:hash', flightController.checkFlightsChanges);
    app.get(urlPrefix + '/api/flights/get-archived-filename', flightController.getArchivedFilename);
    app.get(urlPrefix + '/api/flights/get-archived-flightdetails', flightController.getArchivedFileDetails);
    app.get(urlPrefix + '/api/flights/remove-archived-flightdetails', flightController.deleteArchivedFlights);

    /**
     * @api {post} /api/flights/is-duplicate-file/:id Check the upload file checksum hash to check if the file is duplicate.
     * @apiName Check the upload file checksum hash to check if the file is duplicate.
     * @apiDescription This api will be called before the "/api/fileupload".
     * @apiGroup Flight
     * @apiHeaderExample {json} Header-Example:
     *     {
     *       Content-Type:application/json
     *     }
     * @apiParam {number} id unique ID.
     * @apiParamExample {json} Request-Example:
     * {"md5hash": "05534330f788bca6cc797b6fffb9ffea"}
     * @apiError Error The <400>Exception</400>.
     * @apiSuccess {json} boolean.
     * @apiSuccessExample {json} Success-Response:
     * {"isDuplicate":true}
     * @apiExample Example usage:
     * curl -X POST \
  http://localhost:3000/api/flights/is-duplicate-file/2742 \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{"md5hash": "05534330f788bca6cc797b6fffb9ffea"}'
     */
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

    app.post(urlPrefix + '/api/partnumber', partnumberController.create);

    /**
     * @api {get} /api/partnumbers Get all Part numbers from hcm
     * @apiName Get all Part numbers from hcm
     * @apiGroup Partnumber
     * @apiHeaderExample {json} Header-Example:
     *     {
     *       Content-Type:application/json
     *     }
     * 
     * @apiError Error The <400>Exception</400>.
     * @apiSuccess {json} partnumbers.
     * @apiSuccessExample {json} Success-Response:
     * [
    {
        "id": 1,
        "model": "M2",
        "name": "Matternet",
        "data": {
            "fcs": [
                {
                    "FC_PN": 1,
                    "model": "Pixhawk2",
                    "FC_CPU": "",
                    "FC_FSCM": "",
                    "part_no": "1",
                    "FC_Model": "Pixhawk2",
                    "FC_PN_Comment": "Matternet",
                    "FC_Partnumber": "MN_Pixhawk2",
                    "FC_ACC_Sensor1": "",
                    "FC_ACC_Sensor2": "",
                    "FC_ACC_Sensor3": "",
                    "FC_GYR_Sensor1": "",
                    "FC_GYR_Sensor2": "",
                    "FC_GYR_Sensor3": "",
                    "FC_Manufacturer": "Matternet"
                }
            ],
            "UAV_PN": 1,
            "part_no": "1",
            "HCM_Flag": "y",
            "UAV_ESC1": 1,
            "UAV_ESC2": 1,
            "UAV_ESC3": 1,
            "UAV_ESC4": 1,
            "UAV_ESC5": null,
            "UAV_ESC6": null,
            "UAV_ESC7": null,
            "UAV_ESC8": null,
            "UAV_BLDC1": 1,
            "UAV_BLDC2": 1,
            "UAV_BLDC3": 1,
            "UAV_BLDC4": 1,
            "UAV_BLDC5": null,
            "UAV_BLDC6": null,
            "UAV_BLDC7": null,
            "UAV_BLDC8": null,
            "UAV_MGTOW": "",
            "UAV_Model": "M2",
            "batteries": [
                {
                    "note": "Matternet, own development and manufacturing of Battery",
                    "model": "Sony US18650VC7",
                    "BAT_PN": 1,
                    "part_no": "1",
                    "BAT_FSCM": "",
                    "BAT_Type": "Li Ion",
                    "BAT_Model": "Sony US18650VC7",
                    "BAT_Capacity": 15,
                    "BAT_Chemistry": "NCA / Li(NiCoAl)",
                    "BAT_WireGauge": null,
                    "BAT_PN_Comment": "Matternet, own development and manufacturing of Battery",
                    "BAT_Partnumber": "MNSY-15000-US18",
                    "BAT_Cell_series": 12,
                    "BAT_Voltage_max": "50,40",
                    "BAT_Voltage_min": "39,60",
                    "BAT_Voltage_nom": "44,40",
                    "BAT_Manufacturer": "Matternet",
                    "BAT_Voltage_safe": "42,00",
                    "BAT_Cell_parallel": 5,
                    "BAT_ConnectorType": null,
                    "BAT_ChargeRate_cont": 15,
                    "BAT_Temperature_max": 60,
                    "BAT_Temperature_min": 10,
                    "BAT_Cell_voltage_max": "4,20",
                    "BAT_Cell_voltage_min": "3,30",
                    "BAT_Cell_voltage_nom": "3,70",
                    "BAT_ChargeRate_burst": 30,
                    "BAT_Cell_voltage_safe": "3,50",
                    "BAT_DischargeRate_cont": 40,
                    "BAT_Internal_Impedance": 23,
                    "BAT_DischargeRate_burst": 60,
                    "BAT_DischargeRate_cont_time": 180,
                    "BAT_DischargeRate_burst_time": 15
                }
            ],
            "UAV_Market": "Commercial",
            "UAV_Status": "active",
            "components": [
                {
                    "esc": {
                        "model": "KDEXF-UAS55HVC",
                        "ESC_PN": 1,
                        "ESC_BEC": "No",
                        "part_no": "1",
                        "ESC_FSCM": "",
                        "ESC_Model": "KDEXF-UAS55HVC",
                        "ESC_PWM_max": 600,
                        "ESC_RPM_max": 360,
                        "ESC_Firmware": null,
                        "ESC_Nom_time": 180,
                        "ESC_Cells_max": 12,
                        "ESC_Cells_min": 3,
                        "ESC_IP_Rating": 56,
                        "ESC_Power_nom": 2.44,
                        "ESC_Burst_time": 5,
                        "ESC_PN_Comment": "Matternet",
                        "ESC_PWM_normal": 500,
                        "ESC_Partnumber": "KDEXF_UAS55HVC",
                        "ESC_Current_nom": 55,
                        "ESC_Power_burst": 4.22,
                        "ESC_Voltage_max": "52,20",
                        "ESC_Voltage_min": "11,10",
                        "ESC_Battery_type": "LiPo, LiHV",
                        "ESC_Manufacturer": "KDE Direct",
                        "ESC_Current_burst": 95,
                        "ESC_Active_Braking": "Yes",
                        "ESC_Temperature_max": "80,00",
                        "ESC_Temperature_min": "0,00"
                    },
                    "bldc": {
                        "model": "XM7010HD-16 KV155",
                        "BLDC_PN": 1,
                        "part_no": "1",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": "up to 1000",
                        "BLDC_Model": "XM7010HD-16 KV155",
                        "BLDC_Poles": 28,
                        "BLDC_Bearing": "EZO Hokkaido",
                        "BLDC_Grooves": 24,
                        "BLDC_RPM_max": 7.905,
                        "BLDC_Nom_time": 1.8,
                        "BLDC_kMRating": null,
                        "BLDC_kTRating": null,
                        "BLDC_kVRating": 155,
                        "BLDC_Cells_max": 12,
                        "BLDC_Cells_min": 10,
                        "BLDC_IP_Rating": 34,
                        "BLDC_Power_nom": 770,
                        "BLDC_Burst_time": 30,
                        "BLDC_PN_Comment": "Matternet",
                        "BLDC_Partnumber": "XM7010HD_16_155",
                        "BLDC_Current_nom": 20,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": 1.4,
                        "BLDC_Voltage_max": "51,00",
                        "BLDC_Voltage_min": "30,00",
                        "BLDC_Manufacturer": "Dualsky",
                        "BLDC_Current_burst": 32,
                        "BLDC_Temperature_max": 90,
                        "BLDC_Temperature_min": 0,
                        "BLDC_InternalResistance": 140
                    },
                    "prop": {
                        "model": "PJP-T-L 22x8",
                        "PROP_PN": 1,
                        "part_no": "1",
                        "PROP_FSCM": "",
                        "PROP_Model": "PJP-T-L 22x8",
                        "PROP_Pitch": "8,0",
                        "PROP_RPM_max": 6,
                        "PROP_Diameter": "22,0",
                        "PROP_Material": "Carbon Fiber",
                        "PROP_PN_Comment": "Matternet",
                        "PROP_Partnumber": "PJPTL_22_80",
                        "PROP_Manufacturer": "Xoar"
                    }
                },
                {
                    "esc": {
                        "model": "KDEXF-UAS55HVC",
                        "ESC_PN": 1,
                        "ESC_BEC": "No",
                        "part_no": "1",
                        "ESC_FSCM": "",
                        "ESC_Model": "KDEXF-UAS55HVC",
                        "ESC_PWM_max": 600,
                        "ESC_RPM_max": 360,
                        "ESC_Firmware": null,
                        "ESC_Nom_time": 180,
                        "ESC_Cells_max": 12,
                        "ESC_Cells_min": 3,
                        "ESC_IP_Rating": 56,
                        "ESC_Power_nom": 2.44,
                        "ESC_Burst_time": 5,
                        "ESC_PN_Comment": "Matternet",
                        "ESC_PWM_normal": 500,
                        "ESC_Partnumber": "KDEXF_UAS55HVC",
                        "ESC_Current_nom": 55,
                        "ESC_Power_burst": 4.22,
                        "ESC_Voltage_max": "52,20",
                        "ESC_Voltage_min": "11,10",
                        "ESC_Battery_type": "LiPo, LiHV",
                        "ESC_Manufacturer": "KDE Direct",
                        "ESC_Current_burst": 95,
                        "ESC_Active_Braking": "Yes",
                        "ESC_Temperature_max": "80,00",
                        "ESC_Temperature_min": "0,00"
                    },
                    "bldc": {
                        "model": "XM7010HD-16 KV155",
                        "BLDC_PN": 1,
                        "part_no": "1",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": "up to 1000",
                        "BLDC_Model": "XM7010HD-16 KV155",
                        "BLDC_Poles": 28,
                        "BLDC_Bearing": "EZO Hokkaido",
                        "BLDC_Grooves": 24,
                        "BLDC_RPM_max": 7.905,
                        "BLDC_Nom_time": 1.8,
                        "BLDC_kMRating": null,
                        "BLDC_kTRating": null,
                        "BLDC_kVRating": 155,
                        "BLDC_Cells_max": 12,
                        "BLDC_Cells_min": 10,
                        "BLDC_IP_Rating": 34,
                        "BLDC_Power_nom": 770,
                        "BLDC_Burst_time": 30,
                        "BLDC_PN_Comment": "Matternet",
                        "BLDC_Partnumber": "XM7010HD_16_155",
                        "BLDC_Current_nom": 20,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": 1.4,
                        "BLDC_Voltage_max": "51,00",
                        "BLDC_Voltage_min": "30,00",
                        "BLDC_Manufacturer": "Dualsky",
                        "BLDC_Current_burst": 32,
                        "BLDC_Temperature_max": 90,
                        "BLDC_Temperature_min": 0,
                        "BLDC_InternalResistance": 140
                    },
                    "prop": {
                        "model": "PJP-T-L 22x8",
                        "PROP_PN": 1,
                        "part_no": "1",
                        "PROP_FSCM": "",
                        "PROP_Model": "PJP-T-L 22x8",
                        "PROP_Pitch": "8,0",
                        "PROP_RPM_max": 6,
                        "PROP_Diameter": "22,0",
                        "PROP_Material": "Carbon Fiber",
                        "PROP_PN_Comment": "Matternet",
                        "PROP_Partnumber": "PJPTL_22_80",
                        "PROP_Manufacturer": "Xoar"
                    }
                },
                {
                    "esc": {
                        "model": "KDEXF-UAS55HVC",
                        "ESC_PN": 1,
                        "ESC_BEC": "No",
                        "part_no": "1",
                        "ESC_FSCM": "",
                        "ESC_Model": "KDEXF-UAS55HVC",
                        "ESC_PWM_max": 600,
                        "ESC_RPM_max": 360,
                        "ESC_Firmware": null,
                        "ESC_Nom_time": 180,
                        "ESC_Cells_max": 12,
                        "ESC_Cells_min": 3,
                        "ESC_IP_Rating": 56,
                        "ESC_Power_nom": 2.44,
                        "ESC_Burst_time": 5,
                        "ESC_PN_Comment": "Matternet",
                        "ESC_PWM_normal": 500,
                        "ESC_Partnumber": "KDEXF_UAS55HVC",
                        "ESC_Current_nom": 55,
                        "ESC_Power_burst": 4.22,
                        "ESC_Voltage_max": "52,20",
                        "ESC_Voltage_min": "11,10",
                        "ESC_Battery_type": "LiPo, LiHV",
                        "ESC_Manufacturer": "KDE Direct",
                        "ESC_Current_burst": 95,
                        "ESC_Active_Braking": "Yes",
                        "ESC_Temperature_max": "80,00",
                        "ESC_Temperature_min": "0,00"
                    },
                    "bldc": {
                        "model": "XM7010HD-16 KV155",
                        "BLDC_PN": 1,
                        "part_no": "1",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": "up to 1000",
                        "BLDC_Model": "XM7010HD-16 KV155",
                        "BLDC_Poles": 28,
                        "BLDC_Bearing": "EZO Hokkaido",
                        "BLDC_Grooves": 24,
                        "BLDC_RPM_max": 7.905,
                        "BLDC_Nom_time": 1.8,
                        "BLDC_kMRating": null,
                        "BLDC_kTRating": null,
                        "BLDC_kVRating": 155,
                        "BLDC_Cells_max": 12,
                        "BLDC_Cells_min": 10,
                        "BLDC_IP_Rating": 34,
                        "BLDC_Power_nom": 770,
                        "BLDC_Burst_time": 30,
                        "BLDC_PN_Comment": "Matternet",
                        "BLDC_Partnumber": "XM7010HD_16_155",
                        "BLDC_Current_nom": 20,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": 1.4,
                        "BLDC_Voltage_max": "51,00",
                        "BLDC_Voltage_min": "30,00",
                        "BLDC_Manufacturer": "Dualsky",
                        "BLDC_Current_burst": 32,
                        "BLDC_Temperature_max": 90,
                        "BLDC_Temperature_min": 0,
                        "BLDC_InternalResistance": 140
                    },
                    "prop": {
                        "model": "PJP-T-L 22x8",
                        "PROP_PN": 1,
                        "part_no": "1",
                        "PROP_FSCM": "",
                        "PROP_Model": "PJP-T-L 22x8",
                        "PROP_Pitch": "8,0",
                        "PROP_RPM_max": 6,
                        "PROP_Diameter": "22,0",
                        "PROP_Material": "Carbon Fiber",
                        "PROP_PN_Comment": "Matternet",
                        "PROP_Partnumber": "PJPTL_22_80",
                        "PROP_Manufacturer": "Xoar"
                    }
                },
                {
                    "esc": {
                        "model": "KDEXF-UAS55HVC",
                        "ESC_PN": 1,
                        "ESC_BEC": "No",
                        "part_no": "1",
                        "ESC_FSCM": "",
                        "ESC_Model": "KDEXF-UAS55HVC",
                        "ESC_PWM_max": 600,
                        "ESC_RPM_max": 360,
                        "ESC_Firmware": null,
                        "ESC_Nom_time": 180,
                        "ESC_Cells_max": 12,
                        "ESC_Cells_min": 3,
                        "ESC_IP_Rating": 56,
                        "ESC_Power_nom": 2.44,
                        "ESC_Burst_time": 5,
                        "ESC_PN_Comment": "Matternet",
                        "ESC_PWM_normal": 500,
                        "ESC_Partnumber": "KDEXF_UAS55HVC",
                        "ESC_Current_nom": 55,
                        "ESC_Power_burst": 4.22,
                        "ESC_Voltage_max": "52,20",
                        "ESC_Voltage_min": "11,10",
                        "ESC_Battery_type": "LiPo, LiHV",
                        "ESC_Manufacturer": "KDE Direct",
                        "ESC_Current_burst": 95,
                        "ESC_Active_Braking": "Yes",
                        "ESC_Temperature_max": "80,00",
                        "ESC_Temperature_min": "0,00"
                    },
                    "bldc": {
                        "model": "XM7010HD-16 KV155",
                        "BLDC_PN": 1,
                        "part_no": "1",
                        "BLDC_FSCM": "",
                        "BLDC_MTBR": "up to 1000",
                        "BLDC_Model": "XM7010HD-16 KV155",
                        "BLDC_Poles": 28,
                        "BLDC_Bearing": "EZO Hokkaido",
                        "BLDC_Grooves": 24,
                        "BLDC_RPM_max": 7.905,
                        "BLDC_Nom_time": 1.8,
                        "BLDC_kMRating": null,
                        "BLDC_kTRating": null,
                        "BLDC_kVRating": 155,
                        "BLDC_Cells_max": 12,
                        "BLDC_Cells_min": 10,
                        "BLDC_IP_Rating": 34,
                        "BLDC_Power_nom": 770,
                        "BLDC_Burst_time": 30,
                        "BLDC_PN_Comment": "Matternet",
                        "BLDC_Partnumber": "XM7010HD_16_155",
                        "BLDC_Current_nom": 20,
                        "BLDC_IdleCurrent": "0,500",
                        "BLDC_Power_burst": 1.4,
                        "BLDC_Voltage_max": "51,00",
                        "BLDC_Voltage_min": "30,00",
                        "BLDC_Manufacturer": "Dualsky",
                        "BLDC_Current_burst": 32,
                        "BLDC_Temperature_max": 90,
                        "BLDC_Temperature_min": 0,
                        "BLDC_InternalResistance": 140
                    },
                    "prop": {
                        "model": "PJP-T-L 22x8",
                        "PROP_PN": 1,
                        "part_no": "1",
                        "PROP_FSCM": "",
                        "PROP_Model": "PJP-T-L 22x8",
                        "PROP_Pitch": "8,0",
                        "PROP_RPM_max": 6,
                        "PROP_Diameter": "22,0",
                        "PROP_Material": "Carbon Fiber",
                        "PROP_PN_Comment": "Matternet",
                        "PROP_Partnumber": "PJPTL_22_80",
                        "PROP_Manufacturer": "Xoar"
                    }
                }
            ],
            "UAV_Version": null,
            "UAV_Battery1": 1,
            "UAV_Airframe1": "Quadrocopter",
            "UAV_Airframe2": "4X1",
            "UAV_PN_Comment": "",
            "UAV_Partnumber": "",
            "UAV_Propeller1": 1,
            "UAV_Propeller2": 1,
            "UAV_Propeller3": 1,
            "UAV_Propeller4": 1,
            "UAV_Propeller5": null,
            "UAV_Propeller6": null,
            "UAV_Propeller7": null,
            "UAV_Propeller8": null,
            "UAV_Propulsion": "Electric Motor",
            "UAV_Description": "",
            "UAV_Manufacturer": "Matternet",
            "UAV_Launch_method": "VTOL",
            "manufacturer_name": "Matternet",
            "UAV_Speed_Vertical": "",
            "manufacturer_model": "M2",
            "UAV_Development_year": 2016,
            "UAV_Speed_Horizontal": "",
            "UAV_FlightController1": 1,
            "UAV_FlightController2": null
        },
        "createdAt": "2017-10-04T16:01:29.048Z",
        "updatedAt": "2017-10-04T16:01:29.048Z"
    },
     * @apiExample Example usage:
     * curl -X GET \
  http://localhost:3000/api/partnumbers \
  -H 'Cache-Control: no-cache'
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