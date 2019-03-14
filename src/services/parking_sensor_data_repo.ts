import { GeoPoint } from 'dynamodb-geo/dist/types';
import { ParkingSensorData, ParkingSensorDataModel } from '../models/parking_sensor_data';
import mongoose from 'mongoose';

const UNOCCUPIED = 'Unoccupied';
const MONGODB_URI = 'mongodb://mongo:27017/findparkingdb';

class ParkingSensorDataRepo {
  constructor() {
    mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise;
    // Get the default connection
    const db = mongoose.connection;
    // Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('open', () => { console.log('MongoDB connected'); });
  }

  async upsertAll(sensorDataList: ParkingSensorData[]): Promise<any> {
    try {
      for (let idx = 0; idx < sensorDataList.length; idx++) {
        await this.upsert(sensorDataList[idx]);
        if (idx % 100 === 0) {
          console.log(`Processed ${idx} records`);
        }
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async upsert(sensorData: ParkingSensorData): Promise<any> {
    try {
      const parkingSensorData = sensorData;
      const query = {bay_id: parkingSensorData.bay_id};
      await ParkingSensorDataModel.findOneAndUpdate(query, parkingSensorData, {upsert: true}).exec();
    } catch (err) {
      console.log('upsert error', err);
      return Promise.reject(err);
    }
  }

  // findUnoccupiedParkingWithinRadius(latitude: number, longitude: number, radiusInMeter: number): Promise<any> {
  //   const centrePoint: GeoPoint = {latitude: latitude, longitude: longitude};
  //   return this.ddbGeoDataManager.queryRadius({
  //     RadiusInMeter: radiusInMeter,
  //     CenterPoint: centrePoint
  //   }).then(parkingList => {
  //     console.log(`Found ${parkingList.length} parking spaces`);
  //     return Promise.resolve(parkingList.filter(parking => parking.status.S === UNOCCUPIED));
  //   });
  // }
}

export default ParkingSensorDataRepo;
