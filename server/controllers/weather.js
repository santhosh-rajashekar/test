"use strict";
const flights = require('../models').flights;
const DarkSky = require('dark-sky')
const darksky = new DarkSky('6cea8061798b4f6b5aba44820ca9013b');

module.exports = {

    fetchWeatherData(data) {

        return new Promise((resolve, reject) => {

            var result = { 'status': true, 'message': '', 'updated_data': data };
            var latitude = data.lat;
            var longitude = data.lng;
            var flight_date = data.flight_date;
            var flight_time = data.flight_time;
            var date_time = flight_date + 'T' + flight_time;

            if (!latitude || !longitude || !flight_date || !flight_time) {
                result.status = false;
                result.message = "All the mandatory fields to get the weather data are missing, lattitude, longitude, date and time";
                result.updated_data = data;
                resolve(result);
            }

            darksky
                .latitude(latitude)
                .longitude(longitude)
                .time(date_time)
                .units('auto')
                .language('en')
                .exclude('minutely,daily,hourly,flags')
                .get()
                .then((weatherInfo) => {
                    if (weatherInfo && weatherInfo.currently) {
                        data.weatherInfo = weatherInfo.currently;
                        result.updated_data = data;
                    }
                    resolve(result);
                })
                .catch((err) => {
                    result.status = false;
                    result.message = err;
                    result.updated_data = data;
                    resolve(result);
                });
        });
    }
}