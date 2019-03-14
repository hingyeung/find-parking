// https://dev.socrata.com/foundry/data.melbourne.vic.gov.au/dtpv-d4pf

import { Schema, Model, Document, model } from 'mongoose';
import { ParkingSensorStatus } from '../types';
import { Restriction, RestrictionSchema } from './restriction';
import { GeoJSONPoint, GeoJSONPointSchema } from './geo_json_point';

export interface ParkingSensorData {
  // constructor(
  //   bay_id: string,
  //   st_marker_id: string,
  //   lon: number,
  //   lat: number,
  //   status: ParkingSensorStatus,
  //   restrictions: Restriction[] = []
  // ) {
  //   super();
  //   this.bay_id = bay_id;
  //   this.st_marker_id = st_marker_id;
  //   this.lon = lon;
  //   this.lat = lat;
  //   this.status = status;
  //   this.restrictions = restrictions;
  // }

  // constructor(init?: Partial<ParkingSensorData>) {
  //   Object.assign(this, init);
  // }

  // The unique ID of the parking bay where the parking sensor is located
  bay_id: string;
  // The street marker that is located next to the parking bay with a unique
  // id for the bay. Often a small round, metal plaque found on the pavement
  // next to the bay
  st_marker_id: string;
  // the location of the parking bay (GeoJSON)
  location: GeoJSONPoint;
  // The status will either display:
  //  Occupied – A car is present in the parking bay at that time.
  //  Unoccupied – The parking bay is available at that time.
  status: ParkingSensorStatus;
  // Parking restrictions
  restrictions?: Restriction[];
}

export interface ParkingSensorDataModel extends Document, ParkingSensorData {}

export const ParkingSensorDataSchema: Schema = new Schema({
  bay_id: String,
  st_marker_id: String,
  location: GeoJSONPointSchema,
  status: {
    type: String,
    enum: [ParkingSensorStatus.PRESENT, ParkingSensorStatus.UNOCCUPIED]
  },
  restrictions: [RestrictionSchema]
});

export const ParkingSensorDataModel: Model<ParkingSensorDataModel> = model<ParkingSensorDataModel>('ParkingSensorData', ParkingSensorDataSchema);