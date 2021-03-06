import { Handler } from 'aws-lambda';
import S3 = require('aws-sdk/clients/s3');
import ConfigRepo from './services/config_repo';
import ParkingRestrictionsDataService from './services/parking_restrictions_data_service';
import { ParkingRestrictionSrcData } from './types';
import 'source-map-support/register';
import { putSSMParameter } from './helpers/ssm_helper';

const targetBucket = process.env.TARGET_BUCKET || '',
  targetPrefix = process.env.TARGET_PREFIX || '';

const getS3Options = () => {
  const options = {
    apiVersion: '2006-03-01',
    // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
    s3ForcePathStyle: true
  };

  return Object.assign({}, options, ConfigRepo.getS3Configs());
};

const buildDataFilename = () => {
  const now = new Date(),
    year = now.getFullYear(),
    month = String(now.getMonth() + 1).padStart(2, '0'),
    date = String(now.getDate()).padStart(2, '0'),
    hr = String(now.getHours()).padStart(2, '0'),
    min = String(now.getMinutes()).padStart(2, '0');
  return `parking-restrictions-data_${year}${month}${date}${hr}${min}.json`;
};

const buildS3Path = (bucket: string, key: string) => `s3://${bucket}/${key}`;

const handler: Handler = (event, context, callback) => {
  ParkingRestrictionsDataService.downloadParkingRestrictionsData()
    .then((restrictionList: ParkingRestrictionSrcData[]) => {
      // write the downloaded data to s3
      const outputFile = buildDataFilename(),
        s3 = new S3(getS3Options()),
        s3Params = {
          Body: JSON.stringify(restrictionList),
          Bucket: targetBucket,
          Key: [targetPrefix, outputFile].join('/')
        };
      s3.putObject(s3Params, async (err, data) => {
        if (err) callback(err);
        const savedUrl = buildS3Path(s3Params.Bucket, s3Params.Key);
        console.log(`Parking restriction data saved in ${savedUrl}`);
        // store the s3 url of the parking restriction file to SSM
        // TODO parameter path should contain environment name to have different parameter for different env.
        await putSSMParameter('/find-parking/data/parking-restriction/s3-bucket', s3Params.Bucket);
        await putSSMParameter('/find-parking/data/parking-restriction/s3-key', s3Params.Key);
        callback(undefined, {parkingRestrictionsDataFile: savedUrl});
      });
    })
    .catch((err: Error) => {
      console.log(err);
      callback(err);
  });
};

exports.handler = handler;