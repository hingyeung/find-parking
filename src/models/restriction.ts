import { Schema } from 'mongoose';

export type Restriction = {
  readonly description: string;
  readonly duration: number;
  readonly disabilityExt?: number;
  readonly effectiveOnPH: boolean;
  readonly exemption?: string;
  readonly typeDesc: string;
  readonly fromDay: number;
  readonly toDay: number;
  readonly startTime: string;
  readonly endTime: string;
};

export const RestrictionSchema: Schema = new Schema({
  description: String,
  duration: Number,
  disabilityExt: Number,
  effectiveOnPH: Boolean,
  exemption: String,
  typeDesc: String,
  fromDay: Number,
  toDay: Number,
  startTime: String,
  endTime: String
});