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
export type ParkingRestrictionData = {
  readonly bayId: string;
  readonly deviceId: string;
  // A compact, human-readable description of the overall restrictions.
  // TKT A stands for Ticket Area covers multiple bays within that area.
  // DIS ONLY and DIS are both disabled parking spaces
  readonly description: string[] & { length: 6 };
  // For bays that aren't limited to disabled permits, how much time (minutes)
  // a vehicle with disabled permit can spend in the spot. Usually twice the
  // regular amount of time.
  readonly disabilityExt: number[] & { length: 6 };
  // The time (in minutes) that a vehicle can park at this location.
  readonly duration: number[] & { length: 6 };
  // Does this restriction apply on public holidays
  readonly effectiveOnPH: number[] & { length: 6 };
  // Which vehicles are exempt
  readonly exemption: string[] & { length: 6 };
  // The type of restriction. Eg: "2P Meter" (two hour parking, paid for using a meter),
  // "Disabled Only" (only vehicles with disabled permits can park)
  readonly typedesc: string[] & { length: 6 };
  // The first day in the range on which this restriction applies (0=Sunday, 6=Saturday)
  readonly fromDay: number[] & { length: 6 };
  // The final day in the range, inclusive. (1-5=Monday to Friday)
  readonly toDay: number[] & { length: 6 };
  // The time each day when the restriction applies
  readonly starttime: string[] & { length: 6 };
  // The time each day when the restriction ends
  readonly endtime: string[] & { length: 6 };
};