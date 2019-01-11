import ParkingSensorDataRepo from './services/parking_sensor_data_repo';
import 'source-map-support/register';

// const ParkingSensorDataRepo = require('./services/parking_sensor_data_repo');
new ParkingSensorDataRepo().createTable().then(() => console.log('ok'));