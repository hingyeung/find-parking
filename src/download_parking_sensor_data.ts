import { Handler } from 'aws-lambda';
import ParkingSensorDataService from './services/parking_sensor_data_service';
import S3 = require('aws-sdk/clients/s3');
import ConfigRepo from './services/config_repo';

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
  return `parking-sensor-data_${year}${month}${date}${hr}${min}.json`;
};

const handler: Handler = (event, context) => {
  // download the parking sensor data
  ParkingSensorDataService.downloadLatestParkingSensorData()
    .then((dataList: ParkingSensorData[]) => {
      // write the downloaded data to s3
      const outputFile = buildDataFilename(),
        s3 = new S3(getS3Options()),
        s3Params = {
          Body: JSON.stringify(dataList),
          Bucket: targetBucket,
          Key: [targetPrefix, outputFile].join('/')
        };
      s3.putObject(s3Params, (err, data) => {
        if (err) throw err;
        console.log(`Parking sensor data saved in s3: ${outputFile}`);
      });
    })
    .catch((err: Error) => console.log(err));
};

exports.handler = handler;
