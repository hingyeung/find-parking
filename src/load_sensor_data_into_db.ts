import S3 = require('aws-sdk/clients/s3');
import { Handler } from 'aws-lambda';
import ConfigRepo from'./services/config_repo';
import ParkingSensorDataRepo from './services/parking_sensor_data_repo';
import 'source-map-support/register';

const getS3Options = () => {
  const options = {
    apiVersion: '2006-03-01',
    // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
    s3ForcePathStyle: true
  };

  return Object.assign({}, options, ConfigRepo.getS3Configs());
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
  await psdr.upsertAll(sensorDataList).then(
    (data: any) => {
      console.log('data upserted');
      console.dir(data);
    }
  ).catch(
    (err: Error) => {
      console.log('Failed to upsert sensor data', err);
      return Promise.reject(err);
    });
};

const parseS3Url = (s3Url: string): {bucket: string, key: string} => {
  if (!s3Url) throw new Error(`invalid s3 url: ${s3Url}`);
  const matched = s3Url.match(/^s3:\/\/(.+?)\/(.+)$/);
  if (!matched) throw new Error(`invalid s3 url: ${s3Url}`);
  return {
    bucket: matched[1],
    // Object key may have spaces or unicode non-ASCII characters.
    key: decodeURIComponent(matched[2].replace(/\+/g, ' '))
  };
};

const handler: Handler = async (event, context, callback) => {
  try {
    console.log(event);
    console.log(event.parkingSensorDataFile);
    const s3Src = parseS3Url(event.parkingSensorDataFile);
    const sensorDataList = await getSensorDataFromS3(s3Src.bucket, s3Src.key);
    await loadSensorDataIntoDB(sensorDataList);
    callback(undefined, 'Parking sensor data loaded into database');
  } catch (err) {
    console.log(`failed to load S3 ${event.parkingSensorDataFile} into DB`);
    callback(err);
  }
};

export {handler};