'use strict';
var ParkingSensorDataRepo = require('./services/parking_sensor_data_repo');
new ParkingSensorDataRepo().createTable().then(function () { return console.log('ok'); });
