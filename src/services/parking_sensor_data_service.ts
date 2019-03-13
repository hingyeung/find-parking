import axios from 'axios';
import ParkingSensorData from '../models/parking_sensor_data';

const PARKING_SENSOR_DATA_URL = 'https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?$limit=5000';
class ParkingSensorDataService {
  static async downloadLatestParkingSensorData(): Promise<ParkingSensorData[]> {
    try {
      const response = await axios.get(PARKING_SENSOR_DATA_URL);
      return response.data;
    } catch (err) {
      console.log(`Failed to download parking sensor data from ${PARKING_SENSOR_DATA_URL}: ${err}`);
      throw new Error(err);
    }
  }
}

export default ParkingSensorDataService;