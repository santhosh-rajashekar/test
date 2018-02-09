const partnumber = require('../models').uav_config_meta;
const generateSerialNumber = require('../services').generateSerialNumber;
const datauavs = require('../models').uav_config_current;
const uavRepository = require('../repositories').uav;

module.exports = {

    create(req, res) {

        return partnumber
            .create({
                id: req.body.id,
                UAV_Model: req.body.model,
                UAV_Manufacturer: req.body.name,
                UAV_Version: null,
                UAV_Configuration: req.body.data
            })
            .then(partnumber => res.status(200).send(partnumber))
            .catch(error => res.status(400).send(error));
    },

    list(req, res) {
        return partnumber
            .all()
            .then(partnumber => res.status(200).send(partnumber))
            .catch(error => res.status(400).send(error));
    },

    generate_serials(components) {

        var serials = [];

        for (let i = 0; i < components.fcs.length; i++) {

            if (!components.fcs[i].serial_number) {
                components.fcs[i].serial_number = generateSerialNumber.generate('F');
                serials.push({
                    serial_number: components.fcs[i].serial_number,
                    sub_system: 'F'
                });
            }
        }

        for (let i = 0; i < components.batteries.length; i++) {

            if (!components.batteries[i].serial_number) {
                components.batteries[i].serial_number = generateSerialNumber.generate('B');
                serials.push({
                    serial_number: components.batteries[i].serial_number,
                    sub_system: 'B'
                });
            }
        }

        for (let i = 0; i < components.components.length; i++) {

            if (!components.components[i].bldc.serial_number) {

                components.components[i].bldc.serial_number = generateSerialNumber.generate('M');
                serials.push({
                    serial_number: components.components[i].bldc.serial_number,
                    sub_system: 'M'
                });
            }

            if (!components.components[i].esc.serial_number) {
                components.components[i].esc.serial_number = generateSerialNumber.generate('E');
                serials.push({
                    serial_number: components.components[i].esc.serial_number,
                    sub_system: 'E'
                });
            }

            if (!components.components[i].prop.serial_number) {
                components.components[i].prop.serial_number = generateSerialNumber.generate('P');
                serials.push({
                    serial_number: components.components[i].prop.serial_number,
                    sub_system: 'P'
                });
            }
        }

        return serials;
    },

    containsPartNumberAtPos(uav, partNumber, position) {

        var partNumberFound = false;
        partNumber = partNumber.toLowerCase();

        for (let i = 0; i < uav.components.length; i++) {

            let component = uav.components[i];

            if (component.bldc.BLDC_Partnumber && component.bldc.BLDC_Partnumber.toLowerCase() === partNumber && i == position) {
                partNumberFound = true;
                break;
            }

            if (component.esc.ESC_Partnumber && component.esc.ESC_Partnumber.toLowerCase() === partNumber && i == position) {
                partNumberFound = true;
                break;
            }

            if (component.prop.PROP_Partnumber && component.prop.PROP_Partnumber.toLowerCase() === partNumber && i == position) {
                partNumberFound = true;
                break;
            }
        }

        return partNumberFound;
    },

    containsPartNumber(uav, partNumber) {

        var partNumberFound = false;
        partNumber = partNumber.toLowerCase();

        if (uav.fcs && uav.fcs.length) {
            for (let i = 0; i < uav.fcs.length; i++) {

                if (uav.fcs[i].FC_Partnumber && uav.fcs[i].FC_Partnumber.toLowerCase() === partNumber) {
                    partNumberFound = true;
                    break;
                }
            }
        }

        if (uav.batteries && uav.batteries.length) {
            for (let i = 0; i < uav.batteries.length; i++) {

                if (uav.batteries[i].BAT_Partnumber && uav.batteries[i].BAT_Partnumber.toLowerCase() === partNumber) {
                    partNumberFound = true;
                    break;
                }
            }
        }

        for (let i = 0; i < uav.components.length; i++) {

            let component = uav.components[i];

            if (component.bldc.BLDC_Partnumber && component.bldc.BLDC_Partnumber.toLowerCase() === partNumber) {
                partNumberFound = true;
                break;
            }

            if (component.esc.ESC_Partnumber && component.esc.ESC_Partnumber.toLowerCase() === partNumber) {
                partNumberFound = true;
                break;
            }

            if (component.prop.PROP_Partnumber && component.prop.PROP_Partnumber.toLowerCase() === partNumber) {
                partNumberFound = true;
                break;
            }
        }

        return partNumberFound;
    },

    containsSerialNumber(uav, serialNumber) {

        var serialNumberFound = false;
        serialNumber = serialNumber.toLowerCase();

        if (uav.fcs && uav.fcs.length) {
            for (let i = 0; i < uav.fcs.length; i++) {

                if (uav.fcs[i].serial_number && uav.fcs[i].serial_number.toLowerCase() === serialNumber) {
                    serialNumberFound = true;
                    break;
                }
            }
        }
        if (uav.batteries && uav.batteries.length) {
            for (let i = 0; i < uav.batteries.length; i++) {

                if (uav.batteries[i].serial_number && uav.batteries[i].serial_number.toLowerCase() === serialNumber) {
                    serialNumberFound = true;
                    break;
                }
            }
        }



        for (let i = 0; i < uav.components.length; i++) {

            let component = uav.components[i];

            if (component.bldc.serial_number && component.bldc.serial_number.toLowerCase() === serialNumber) {
                serialNumberFound = true;
                break;
            }

            if (component.esc.serial_number && component.esc.serial_number.toLowerCase() === serialNumber) {
                serialNumberFound = true;
                break;
            }

            if (component.prop.serial_number && component.prop.serial_number.toLowerCase() === serialNumber) {
                serialNumberFound = true;
                break;
            }
        }

        return serialNumberFound;
    },

    createDefaultUavDataComponent(req, res) {

        return partnumber
            .findAll({
                where: {
                    UAV_Model: req.body.model,
                    UAV_Manufacturer: req.body.name
                }
            }).then(partnumber => {

                if (!partnumber) {
                    return res.status(400).send('Entity does not found');
                }

                let components = partnumber[0].toJSON().UAV_Configuration;
                components.uav_id = req.body.uav_id;
                console.log('called createDefaultUavDataComponent');

                var generate_serials = () => {
                    var serials = [];
                    for (let i = 0; i < components.fcs.length; i++) {
                        components.fcs[i].serial_number = generateSerialNumber.generate('F');
                        serials.push({
                            serial_number: components.fcs[i].serial_number,
                            sub_system: 'F'
                        });
                    }

                    for (let i = 0; i < components.batteries.length; i++) {
                        components.batteries[i].serial_number = generateSerialNumber.generate('B');
                        serials.push({
                            serial_number: components.batteries[i].serial_number,
                            sub_system: 'B'
                        });
                    }

                    for (let i = 0; i < components.components.length; i++) {
                        components.components[i].bldc.serial_number = generateSerialNumber.generate('M');
                        serials.push({
                            serial_number: components.components[i].bldc.serial_number,
                            sub_system: 'M'
                        });

                        components.components[i].esc.serial_number = generateSerialNumber.generate('E');
                        serials.push({
                            serial_number: components.components[i].esc.serial_number,
                            sub_system: 'E'
                        });

                        components.components[i].prop.serial_number = generateSerialNumber.generate('P');
                        serials.push({
                            serial_number: components.components[i].prop.serial_number,
                            sub_system: 'P'
                        });
                    }

                    return serials;
                };

                var check_serials = () => {
                    var serials = generate_serials(components);

                    uavRepository.ifSerialNumberExists(serials, (result) => {
                        if (!result) {
                            req.body.data = components;
                            req.body.id = req.body.uav_id;

                            return datauavs
                                .create({
                                    id: req.body.id,
                                    data: req.body.data
                                })
                                .then(datauavs => res.status(200).send(datauavs))
                                .catch(error => {
                                    console.log(error);
                                    res.status(400).send(error)
                                });
                        } else {
                            check_serials();
                        }
                    });
                };

                check_serials();

            }).catch(error => {
                console.log(error);
                res.status(400).send(error)
            });
    },


};