import { ParkingSensorData, ParkingSensorDataModel } from '../models/parking_sensor_data';
import mongoose from 'mongoose';
import { GeoJSONPoint, GeoJSONPointClass } from '../models/geo_json_point';
import ConfigRepo from './config_repo';
import { ParkingSensorStatus } from '../types';
import { getSSMParameter } from '../helpers/ssm_helper';

const DB_NAME = 'findparkingdb';

class ParkingSensorDataRepo {
  constructor() {
    ParkingSensorDataRepo.connectToMongoDB();
  }

  static async connectToMongoDB() {
    // const mongodb_uri = ConfigRepo.getMongoDBConfig().uri;
    const mongodb_uri = await ParkingSensorDataRepo.getMongoDBUriFromSSM();
    console.log('Connecting to MongoDB:', mongodb_uri);
    mongoose.connect([mongodb_uri, DB_NAME].join('/'), {useNewUrlParser: true});

    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise;
    // Get the default connection
    const db = mongoose.connection;
    // Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('open', () => { console.log('MongoDB connected'); });
  }

  static async getMongoDBUriFromSSM() {
    const hostname = await getSSMParameter('/find-parking/config/mongodb/host');
    const port = await getSSMParameter('/find-parking/config/mongodb/port');
    const username = await getSSMParameter('/find-parking/config/mongodb/username');
    const password = await getSSMParameter('/find-parking/config/mongodb/password');
    return `mongodb://${username}:${password}@${hostname}:${port}`;
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
