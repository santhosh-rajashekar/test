const partnumber = require('../models').part_numbers;
const generateSerialNumber = require('../services').generateSerialNumber;
const datauavs = require('../models').datauavs;
const uavRepository = require('../repositories').uav;

module.exports = {

    create(req, res) {

        return partnumber
            .create({
                id: req.body.id,
                model: req.body.model,
                name: req.body.name,
                data: req.body.data
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

    createDefaultUavDataComponent(req, res) {

        return partnumber
            .findAll({
                where: {
                    model: req.body.model,
                    name: req.body.name
                }
            }).then(partnumber => {

                if (!partnumber) {
                    return res.status(400).send('Entity does not found');
                }

                let components = partnumber[0].toJSON().data;
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