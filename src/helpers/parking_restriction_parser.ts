import { ParkingRestrictionSrcData, Restriction } from '../types';

const parseParkingRestriction = (parkingRestriction: ParkingRestrictionSrcData) => {
  // 1. determine the number of restrictions by checking how many fields there are that matches "description\d" pattern
  const restrictionCount = Object.keys(parkingRestriction).filter((k: string) => k.match(/description\d+/)).length;

  // 2. parse the restriction fields
  let restrictions: Restriction[] = [];
  for (let idx = 1; idx <= restrictionCount; idx++) {
    const restriction: Restriction = {
      description: parkingRestriction[`description${idx}`] + '',
      duration: parseInt(parkingRestriction[`duration${idx}`] + ''),
      effectiveOnPH: parseInt(parkingRestriction[`effectiveonph${idx}`] + '') == 1,
      typeDesc: parkingRestriction[`typedesc${idx}`] + '',
      fromDay: parseInt(parkingRestriction[`fromday${idx}`] + ''),
      toDay: parseInt(parkingRestriction[`today${idx}`] + ''),
      startTime: parkingRestriction[`starttime${idx}`] + '',
      endTime: parkingRestriction[`endtime${idx}`] + '',
      disabilityExt: `disabilityext${idx}` in parkingRestriction ? parseInt(parkingRestriction[`disabilityext${idx}`] + '') : undefined,
      exemption: `exemption1${idx}` in parkingRestriction ? parkingRestriction[`exemption${idx}`] + '' : undefined
    };
    restrictions = restrictions.concat(restriction);
  }

  return restrictions;
};