import S3 = require('aws-sdk/clients/s3');
import { Handler } from 'aws-lambda';
import ConfigRepo from './services/config_repo';
import ParkingSensorDataRepo from './services/parking_sensor_data_repo';
import 'source-map-support/register';
import { ParkingRestrictionMap } from './types';
import { parseParkingRestrictionSrc } from './helpers/parking_restriction_helper';
import { getSSMParameter } from './helpers/ssm_helper';
import { ParkingSensorData } from './models/parking_sensor_data';
import { ParkingSensorSrcData } from './models/parking_sensor_src_data';

const getS3Options = () => {
  const options = {
    apiVersion: '2006-03-01',
    // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
    s3ForcePathStyle: true
  };

  return Object.assign({}, options, ConfigRepo.getS3Configs());
};

const convertParkingSensorSrcData = (srcDataList: ParkingSensorSrcData[]): ParkingSensorData[] => {
  return srcDataList.map((srcData) => {
    return {
      bay_id: srcData.bay_id,
      st_marker_id: srcData.st_marker_id,
      status: srcData.status,
      location: {
        type: 'Point',
        coordinates: [srcData.lon, srcData.lat] as [number, number]
      }
    };
  });
};

const getSensorDataFromS3 = (srcBucket: string, srcKey: string): Promise<ParkingSensorData[]> => {
  const s3 = new S3(getS3Options());
  return new Promise((resolve, reject) => {
    s3.getObject({Bucket: srcBucket, Key: srcKey}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Loaded parking sensor data: ${data.ContentType}, ${data.ContentLength} bytes`);
        resolve(convertParkingSensorSrcData(JSON.parse(data.Body.toString())));
      }
    });
  });
};

const getParkingRestrictionFromS3 = (srcBucket: string, srcKey: string): Promise<ParkingRestrictionMap> => {
  const s3 = new S3(getS3Options());
  return new Promise((resolve, reject) => {
    s3.getObject({Bucket: srcBucket, Key: srcKey}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Loaded parking restriction data: ${data.ContentType}, ${data.ContentLength} bytes`);
        resolve(parseParkingRestrictionSrc(JSON.parse(data.Body.toString())));
      }
    });
  });
};

const loadSensorDataIntoDB = async (sensorDataList: ParkingSensorData[]) => {
  const psdr = new ParkingSensorDataRepo();
  await psdr.upsertAll(sensorDataList).then(
    () => {
      console.log('data upserted');
      return Promise.resolve();
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

const hydrateParkingSensorDataWithParkingRestriction =
  (sensorDataList: ParkingSensorData[], parkingRestrictionMap: ParkingRestrictionMap): ParkingSensorData[] => {
  return sensorDataList.map((sensorData) => {
    return {
      bay_id: sensorData.bay_id,
      st_marker_id: sensorData.st_marker_id,
      location: sensorData.location,
      status: sensorData.status,
      restrictions: parkingRestrictionMap[sensorData.bay_id] ? parkingRestrictionMap[sensorData.bay_id].restriction : undefined
    };
  });
};

const handler: Handler = async (event, context, callback) => {
  try {
    // lambda does not exit if there is an open connection to mongodb
    context.callbackWaitsForEmptyEventLoop = false;
    console.log(event);

    const parkingSensorS3Src = parseS3Url(event.parkingSensorDataFile);
    // load the latest parking sensor data from S3
    const sensorDataList = await getSensorDataFromS3(parkingSensorS3Src.bucket, parkingSensorS3Src.key);
    // load the latest parking restriction ifrom S3
    const parkingRestrictionS3Bucket = await getSSMParameter('/find-parking/data/parking-restriction/s3-bucket');
    const parkingRestrictionS3Key = await getSSMParameter('/find-parking/data/parking-restriction/s3-key');
    const parkingRestrictionMap = await getParkingRestrictionFromS3(parkingRestrictionS3Bucket, parkingRestrictionS3Key);

    const hydratedSensorDataList = hydrateParkingSensorDataWithParkingRestriction(sensorDataList, parkingRestrictionMap);

    await loadSensorDataIntoDB(hydratedSensorDataList);
    callback(undefined, 'Parking sensor data loaded into database');
  } catch (err) {
    console.log(`failed to load ${event.parkingSensorDataFile} into DB`);
    callback(err);
  }
};

export {handler};