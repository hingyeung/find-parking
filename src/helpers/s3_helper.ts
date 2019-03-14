import ConfigRepo from '../services/config_repo';
import S3 = require('aws-sdk/clients/s3');
import { ParkingSensorData } from '../models/parking_sensor_data';

export const getS3Options = () => {
  const options = {
    apiVersion: '2006-03-01',
    // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
    s3ForcePathStyle: true
  };

  return Object.assign({}, options, ConfigRepo.getS3Configs());
};

export const buildDataFilename = (filenamePrefix: string) => {
  const now = new Date(),
    year = now.getFullYear(),
    month = String(now.getMonth() + 1).padStart(2, '0'),
    date = String(now.getDate()).padStart(2, '0'),
    hr = String(now.getHours()).padStart(2, '0'),
    min = String(now.getMinutes()).padStart(2, '0');
  return `${filenamePrefix}_${year}${month}${date}${hr}${min}.json`;
};

export const getDataFromS3 = (srcBucket: string, srcKey: string): Promise<ParkingSensorData[]> => {
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

export const parseS3Url = (s3Url: string): {bucket: string, key: string} => {
  if (!s3Url) throw new Error(`invalid s3 url: ${s3Url}`);
  const matched = s3Url.match(/^s3:\/\/(.+?)\/(.+)$/);
  if (!matched) throw new Error(`invalid s3 url: ${s3Url}`);
  return {
    bucket: matched[1],
    // Object key may have spaces or unicode non-ASCII characters.
    key: decodeURIComponent(matched[2].replace(/\+/g, ' '))
  };
};

export const buildS3Path = (bucket: string, key: string) => `s3://${bucket}/${key}`;