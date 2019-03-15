// https://dev.socrata.com/foundry/data.melbourne.vic.gov.au/dtpv-d4pf

import { Schema, Model, Document, model } from 'mongoose';
import { ParkingSensorStatus } from '../types';
import { Restriction, RestrictionSchema } from './restriction';
import { GeoJSONPoint, GeoJSONPointSchema } from './geo_json_point';

export interface ParkingSensorData {
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

const ParkingSensorDataSchema: Schema = new Schema({
  bay_id: { type: String, required: true, unique: true },
  st_marker_id: String,
  location: GeoJSONPointSchema,
  status: {
    required: true,
    type: String,
    enum: [ParkingSensorStatus.PRESENT, ParkingSensorStatus.UNOCCUPIED]
  },
  restrictions: [RestrictionSchema]
});
ParkingSensorDataSchema.index({location: '2dsphere'});

export const ParkingSensorDataModel: Model<ParkingSensorDataModel> = model<ParkingSensorDataModel>('ParkingSensorData', ParkingSensorDataSchema);