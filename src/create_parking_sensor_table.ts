import ParkingSensorDataRepo from './services/parking_sensor_data_repo';
import 'source-map-support/register';
import ParkingRestrictionsDataRepo from './services/parking_restrictions_data_repo';
import 'source-map-support/register';

new ParkingSensorDataRepo().createTable()
  .then(() => console.log('Parking sensor table created'))
  .catch(err => console.log('Failed to create parking sensor data table', err));

new ParkingRestrictionsDataRepo().createTable()
  .then(() => console.log('Parking restrictions table created'))
  .catch(err => console.log('Failed to create parking restrictions data table'));