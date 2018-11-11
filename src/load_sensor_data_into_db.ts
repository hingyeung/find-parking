import S3 = require('aws-sdk/clients/s3');
import { S3Event, S3Handler } from 'aws-lambda';

const ConfigRepo = require('./config_repo');
const ParkingSensorDataRepo = require('./parking_sensor_data_repo');

const getS3Options = () => {
  const options = {
    apiVersion: '2006-03-01',
    // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
    s3ForcePathStyle: true
  }, configRepo = new ConfigRepo();

  return Object.assign({}, options, configRepo.getS3Configs());
};

const getSensorDataFromS3 = (srcBucket: string, srcKey: string): Promise<ParkingSensorData[]> => {
  const s3 = new S3(getS3Options());
  return new Promise((resolve, reject) => {
    s3.getObject({Bucket: srcBucket, Key: srcKey}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Loaded parking sensor data: ${data.ContentType}, ${data.ContentLength} bytes`);
        resolve(JSON.parse(data.Body.toString()));
      }
    });
  });
};

const loadSensorDataIntoDB = async (sensorDataList: ParkingSensorData[]) => {
  const psdr = new ParkingSensorDataRepo();
  // const res = await psdr.createTable()
  //   .catch((err: Error) => {
  //     console.log('Failed to load sensor data into DB', err);
  //     return Promise.reject(err);
  //   });
  await psdr.upsertBatchData(sensorDataList).catch((err: Error) => {
    console.log('Failed to upsert sensor data', err);
    return Promise.reject(err);
  });
};


const s3Handler: S3Handler = async (event: S3Event) => {
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey =
    decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  console.log(`Lambda function triggered by ${srcBucket}/${srcKey}`);

  const sensorDataList = await getSensorDataFromS3(srcBucket, srcKey);
  await loadSensorDataIntoDB(sensorDataList);
};

exports.handler = s3Handler;