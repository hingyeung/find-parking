import axios from 'axios';
import { ParkingRestrictionSrcData } from '../types';

const PARKING_RESTRICTIONS_DATA_URL = 'https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json';
class ParkingRestrictionsDataService {
  static async downloadParkingRestrictionsData(): Promise<ParkingRestrictionSrcData[]> {
    try {
      const response = await axios.get(PARKING_RESTRICTIONS_DATA_URL);
      return response.data;
    } catch (err) {
      console.log(`Failed to download parking restrictions data from ${PARKING_RESTRICTIONS_DATA_URL}: ${err}`);
      throw err;
    }
  }
}

export default ParkingRestrictionsDataService;