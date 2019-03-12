import { Handler } from 'aws-lambda';
import { parseS3Url } from './helpers/s3_helper';
import ParkingRestrictionsDataRepo from './services/parking_restrictions_data_repo';

const handler: Handler = (event, context, callback) => {
  // try {
  //   console.log(event);
  //   const s3Src = parseS3Url(event.parkingRestrictionsDataFile);
  //   console.log(s3Src);
  //   const parkingRestrictionDataRepo = new ParkingRestrictionsDataRepo();
  //   parkingRestrictionDataRepo.upsert({
  //     bayId: 'bayId1',
  //     deviceId: 'deviceId11',
  //     description: ['a11', 'b1', 'c1', 'd1', 'e1', 'f1']
  //   })
  //     .then(() => {console.log('DONE'); callback(undefined, 'Parking restrictions data loaded into database'); })
  //     .catch((err) => {console.log('ERROR'); callback(err); });
  // } catch (err) {
  //   console.log(`failed to load S3 ${event.parkingRestrictionsDataFile} into DB`);
  //   callback(err);
  // }
};

exports.handler = handler;
