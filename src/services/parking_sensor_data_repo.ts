import { ParkingSensorData, ParkingSensorDataModel } from '../models/parking_sensor_data';
import mongoose from 'mongoose';
import { GeoJSONPoint, GeoJSONPointClass } from '../models/geo_json_point';
import { ParkingSensorStatus } from '../types';
import { getSSMParameter } from '../helpers/ssm_helper';

class ParkingSensorDataRepo {
  constructor() {
    ParkingSensorDataRepo.connectToMongoDB();
  }

  static async connectToMongoDB() {
    // const mongodb_uri = ConfigRepo.getMongoDBConfig().uri;
    const mongodb_uri = await getSSMParameter('/find-parking/config/mongodb/uri');
    mongoose.connect(mongodb_uri, {useNewUrlParser: true});

    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise;
    // Get the default connection
    const db = mongoose.connection;
    // Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('open', () => { console.log('MongoDB connected', Math.random()); });
  }

  upsertAll(sensorDataList: ParkingSensorData[]): Promise<any> {
    const bulkOps = sensorDataList.map((sensorData => {
      return {
        updateOne: {
          filter: {bay_id: sensorData.bay_id},
          update: sensorData,
          upsert: true
        }
      };
    }));

    return new Promise((resolve, reject) => {
      ParkingSensorDataModel.bulkWrite(bulkOps)
        .then(res => {
          console.log(`inserted: ${res.insertedCount}, modified: ${res.modifiedCount}, deleted: ${res.deletedCount}`);
          resolve(res);
        })
        .catch(err => reject(err));
    });
  }

  findUnoccupiedParkingWithinRadius(latitude: number, longitude: number, radiusInMeter: number): Promise<any> {
    const centrePoint: GeoJSONPoint = new GeoJSONPointClass(longitude, latitude);
    const query = ParkingSensorDataModel.find().where('location').near({
      center: centrePoint,
      maxDistance: radiusInMeter
    }).where('status').equals(ParkingSensorStatus.UNOCCUPIED);
    return query.exec();
  }
}

export default ParkingSensorDataRepo;
