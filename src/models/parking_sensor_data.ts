// https://dev.socrata.com/foundry/data.melbourne.vic.gov.au/dtpv-d4pf

import { Restriction } from '../types';

export default class ParkingSensorData {
  constructor(
    bay_id: string,
    st_marker_id: string,
    lon: number,
    lat: number,
    status: string,
    restrictions: Restriction[] = []
  ) {
    this.bay_id = bay_id;
    this.st_marker_id = st_marker_id;
    this.lon = lon;
    this.lat = lat;
    this.status = status;
    this.restrictions = restrictions;
  }

  // The unique ID of the parking bay where the parking sensor is located
  bay_id: string;
  // The street marker that is located next to the parking bay with a unique
  // id for the bay. Often a small round, metal plaque found on the pavement
  // next to the bay
  st_marker_id: string;
  // The longitude of the parking bay
  lon: number;
  // The latitude of the parking bay
  lat: number;
  // The status will either display:
  //  Occupied – A car is present in the parking bay at that time.
  //  Unoccupied – The parking bay is available at that time.
  status: string;
  // Parking restrictions
  restrictions?: Restriction[];
}