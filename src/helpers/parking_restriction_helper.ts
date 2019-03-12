import { ParkingRestriction, ParkingRestrictionMap, ParkingRestrictionSrcData, Restriction } from '../types';

export const parseParkingRestriction = (parkingRestrictionSrcData: ParkingRestrictionSrcData): Restriction[] => {
  // 1. determine the number of restrictions by checking how many fields there are that matches "description\d" pattern
  const restrictionCount = Object.keys(parkingRestrictionSrcData).filter((k: string) => k.match(/description\d+/)).length;

  // 2. parse the restriction fields
  let restrictions: Restriction[] = [];
  for (let idx = 1; idx <= restrictionCount; idx++) {
    const restriction: Restriction = {
      description: parkingRestrictionSrcData[`description${idx}`] + '',
      duration: parseInt(parkingRestrictionSrcData[`duration${idx}`] + ''),
      effectiveOnPH: parseInt(parkingRestrictionSrcData[`effectiveonph${idx}`] + '') == 1,
      typeDesc: parkingRestrictionSrcData[`typedesc${idx}`] + '',
      fromDay: parseInt(parkingRestrictionSrcData[`fromday${idx}`] + ''),
      toDay: parseInt(parkingRestrictionSrcData[`today${idx}`] + ''),
      startTime: parkingRestrictionSrcData[`starttime${idx}`] + '',
      endTime: parkingRestrictionSrcData[`endtime${idx}`] + '',
      disabilityExt: `disabilityext${idx}` in parkingRestrictionSrcData ? parseInt(parkingRestrictionSrcData[`disabilityext${idx}`] + '') : undefined,
      exemption: `exemption1${idx}` in parkingRestrictionSrcData ? parkingRestrictionSrcData[`exemption${idx}`] + '' : undefined
    };
    restrictions = restrictions.concat(restriction);
  }

  return restrictions;
};

export const parseParkingRestrictionSrc = (parkingRestrictionSrcDataList: ParkingRestrictionSrcData[]): ParkingRestrictionMap => {
  const parkingRestrictionMap: ParkingRestrictionMap = {};
  parkingRestrictionSrcDataList.forEach((parkingRestrictionSrdData) => {
    const parkingRestriction: ParkingRestriction = {
      bayId: parkingRestrictionSrdData.bayid + '',
      deviceId: parkingRestrictionSrdData.deviceid + '',
      restriction: parseParkingRestriction(parkingRestrictionSrdData)
    };
    parkingRestrictionMap[parkingRestrictionSrdData.bayid] = parkingRestriction;
  });
  return parkingRestrictionMap;
};