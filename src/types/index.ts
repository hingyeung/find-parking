import { Restriction } from '../models/restriction';

export interface Point {
  lat: number;
  lng: number;
}

export interface ParkingSpace {
  coordinate: Point;
  bay_id: string;
}

// https://dev.socrata.com/foundry/data.melbourne.vic.gov.au/ntht-5rk7
// There can be multiple restrictions, occurring at non-overlapping times.
// Each restriction is a set of columns with a number:
// FromDay1, ToDay1, StartTime1, EndTime1, etc.
export type ParkingRestrictionSrcData = {
  readonly bayid: string;
  readonly deviceid: string;
  // A compact, human-readable description of the overall restrictions.
  // TKT A stands for Ticket Area covers multiple bays within that area.
  // DIS ONLY and DIS are both disabled parking spaces
  readonly description1: string;
  readonly description2?: string;
  readonly description3?: string;
  readonly description4?: string;
  readonly description5?: string;
  readonly description6?: string;
  // For bays that aren't limited to disabled permits, how much time (minutes)
  // a vehicle with disabled permit can spend in the spot. Usually twice the
  // regular amount of time.
  readonly disabilityext1?: string;
  readonly disabilityext2?: string;
  readonly disabilityext3?: string;
  readonly disabilityext4?: string;
  readonly disabilityext5?: string;
  readonly disabilityext6?: string;
  // The time (in minutes) that a vehicle can park at this location.
  readonly duration1: string;
  readonly duration2?: string;
  readonly duration3?: string;
  readonly duration4?: string;
  readonly duration5?: string;
  readonly duration6?: string;
  // Does this restriction apply on public holidays
  readonly effectiveonph1: string;
  readonly effectiveonph2?: string;
  readonly effectiveonph3?: string;
  readonly effectiveonph4?: string;
  readonly effectiveonph5?: string;
  readonly effectiveonph6?: string;
  // Which vehicles are exempt
  readonly exemption1?: string;
  readonly exemption2?: string;
  readonly exemption3?: string;
  readonly exemption4?: string;
  readonly exemption5?: string;
  readonly exemption6?: string;
  // The type of restriction. Eg: "2P Meter" (two hour parking, paid for using a meter),
  // "Disabled Only" (only vehicles with disabled permits can park)
  readonly typedesc1: string;
  readonly typedesc2?: string;
  readonly typedesc3?: string;
  readonly typedesc4?: string;
  readonly typedesc5?: string;
  readonly typedesc6?: string;
  // The first day in the range on which this restriction applies (0=Sunday, 6=Saturday)
  readonly fromday1: string;
  readonly fromday2?: string;
  readonly fromday3?: string;
  readonly fromday4?: string;
  readonly fromday5?: string;
  readonly fromday6?: string;
  // The final day in the range, inclusive. (1-5=Monday to Friday)
  readonly today1: string;
  readonly today2?: string;
  readonly today3?: string;
  readonly today4?: string;
  readonly today5?: string;
  readonly today6?: string;
  // The time each day when the restriction applies
  readonly starttime1: string;
  readonly starttime2?: string;
  readonly starttime3?: string;
  readonly starttime4?: string;
  readonly starttime5?: string;
  readonly starttime6?: string;
  // The time each day when the restriction ends
  readonly endtime1?: string;
  readonly endtime2?: string;
  readonly endtime3?: string;
  readonly endtime4?: string;
  readonly endtime5?: string;
  readonly endtime6?: string;

  // index signatures
  [key: string]: string | number;
};

export type ParkingRestriction = {
  readonly bayId: string;
  readonly deviceId: string;
  readonly restriction: Restriction[];
};

export enum SSMParameterType {
  STRING = 'String',
  STRING_LIST = 'StringList',
  SECURE_STRING = 'SecureString'
}

export enum ParkingSensorStatus {
  UNOCCUPIED = 'Unoccupied',
  PRESENT = 'Present'
}

export type SSMGetParameterParam = {
  readonly Name: string;
  readonly Type: SSMParameterType;
  readonly Value: string;
  readonly Description?: string;
  readonly Overwrite: boolean;
};

export type SSMPutParameterParam = {
  readonly Name: string;
  readonly WithDecryption: boolean
};

export type ParkingRestrictionMap = {
  [bayId: string]: ParkingRestriction
};