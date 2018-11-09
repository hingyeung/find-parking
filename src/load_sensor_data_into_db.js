const AWS = require('aws-sdk');
const ConfigRepo = require('./config_repo');
const ParkingSensorDataRepo = require('./parking_sensor_data_repo');
const SENSOR_DATA = {
  "st_marker_id" : "7325W",
  "bay_id" : "3591",
  "lon" : "144.94924192693372",
  "lat" : "-37.80563667842449",
  "status" : "Unoccupied"
};

const getS3Options = () => {
  let options = {
    apiVersion: '2006-03-01',
    // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
    s3ForcePathStyle: true
  }, configRepo = new ConfigRepo();

  return Object.assign({}, options, configRepo.getS3Configs());
}

const getSensorDataFromS3 = (srcBucket, srcKey) => {
  const s3 = new AWS.S3(getS3Options());
  const promise = new Promise((resolve, reject) => {
    s3.getObject({Bucket: srcBucket, Key: srcKey}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Loaded parking sensor data: ${data.ContentType}, ${data.ContentLength} bytes`);
        resolve(JSON.parse(data.Body.toString('utf-8')));
      }
    })
  });

  return promise;
}

const loadSensorDataIntoDB = async (sensorData) => {
  const psdr = new ParkingSensorDataRepo();
  // const res = await psdr.createTable()
  //   .catch((err) => {
  //     console.log('Failed to load sensor data into DB', err);
  //     return Promise.reject(err);
  //   });
  await psdr.upsertData(sensorData).catch((err) => {
    console.log("Failed to upsert sensor data", err);
    return Promise.reject(err);
  });
}

exports.handler = async function(event, context, callback) {
  let srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
  let srcKey    =
    decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  console.log(`Lambda function triggered by ${srcBucket}/${srcKey}`);

  const sensorData = await getSensorDataFromS3(srcBucket, srcKey);
  await loadSensorDataIntoDB(SENSOR_DATA);
};
