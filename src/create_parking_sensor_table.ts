'use strict';

const ParkingSensorDataRepo = require('./services/parking_sensor_data_repo');
new ParkingSensorDataRepo().createTable().then(() => console.log('ok'));