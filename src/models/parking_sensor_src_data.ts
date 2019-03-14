import { GeoJSONPoint } from './geo_json_point';
import { ParkingSensorStatus } from '../types';
import { Restriction } from './restriction';

export interface ParkingSensorSrcData {
  // The unique ID of the parking bay where the parking sensor is located
  bay_id: string;
  // The street marker that is located next to the parking bay with a unique
  // id for the bay. Often a small round, metal plaque found on the pavement
  // next to the bay
  st_marker_id: string;
  // the latitude of the parking bay
  lat: number;
  // the longitute of the parking bay
  lon: number;
  // The status will either display:
  //  Occupied – A car is present in the parking bay at that time.
  //  Unoccupied – The parking bay is available at that time.
  status: ParkingSensorStatus;
}