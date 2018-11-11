'use strict';

const ParkingSensorDataRepo = require('../dist/parking_sensor_data_repo');
new ParkingSensorDataRepo().createTable().then(() => console.log('ok'));