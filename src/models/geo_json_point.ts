import { Document, model, Model, Schema } from 'mongoose';

export interface GeoJSONPoint {
  type: string;
  coordinates: [number, number];
}

export class GeoJSONPointClass implements GeoJSONPoint {
  readonly type: string = 'Point';
  readonly coordinates: [number, number];

  constructor(longitude: number, latitude: number) {
    this.coordinates = [longitude, latitude];
  }
}

export interface GeoJSONPointModel extends Document, GeoJSONPoint {
}

export const GeoJSONPointSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['Point'],   // location.type must be Point
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
}, {_id : false});

export const GeoJSONPointModel: Model<GeoJSONPointModel> = model<GeoJSONPointModel>('GeoJSONPoint', GeoJSONPointSchema);