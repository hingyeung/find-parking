import { DynamoDB } from 'aws-sdk';
import { GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo';
import { PutPointInput, GetPointInput } from 'dynamodb-geo/dist/types';

const AWS = require('aws-sdk');
const ddbGeo = require('dynamodb-geo');
const ConfigRepo = require('./config_repo');
const PARKING_SENSOR_DATA_TABLE_NAME = 'ParkingSensorTable';

class ParkingSensorDataRepo {
  ddb: DynamoDB;
  ddbGeoConfig: GeoDataManagerConfiguration;
  ddbGeoDataManager: GeoDataManager;

  constructor() {
    const configRepo = new ConfigRepo();
    this.ddb = new AWS.DynamoDB(configRepo.getDynamoDBConfigs());
    this.ddbGeoConfig = new ddbGeo.GeoDataManagerConfiguration(this.ddb, PARKING_SENSOR_DATA_TABLE_NAME);
    this.ddbGeoConfig.hashKeyLength = 7;
    this.ddbGeoDataManager = new ddbGeo.GeoDataManager(this.ddbGeoConfig);
  }

  createTable() {
    const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(this.ddbGeoConfig);
    createTableInput.ProvisionedThroughput.ReadCapacityUnits = 2;
    createTableInput.ProvisionedThroughput.WriteCapacityUnits = 2;
    // createTableInput.AttributeDefinitions.push({AttributeName: "status", AttributeType: "S"})
    console.dir(createTableInput, {depth: undefined});

    return this.ddb.createTable(createTableInput).promise()
      .then(() => {
        console.log('Waiting for table to be created');
        return this.ddb.waitFor('tableExists', {TableName: this.ddbGeoConfig.tableName}).promise();
      })
      .then(() => {
        console.log('Table created and ready!');
        return Promise.resolve();
      })
      .catch((err) => {
        console.log('Failed to create table', err);
        return Promise.reject(err);
      });
  }

  _get(sensorData: ParkingSensorData) {
    const getPointInput = {
      RangeKeyValue: { S: sensorData.bay_id },
      GeoPoint: { latitude: sensorData.lat, longitude: sensorData.lon },
      GetItemInput: {
        TableName: PARKING_SENSOR_DATA_TABLE_NAME,
        // I wonder if dyanmodb-geo would fill the Key for me.
        // It fills the Key for "update" and "add".
        // Typescript type definition demands the Key attribute to be presences
        Key: {}
      }
    };
    return this.ddbGeoDataManager.getPoint(getPointInput).promise();
  }

  upsert(sensorData: ParkingSensorData) {
    // 1. Get the original item
    return this._get(sensorData).then(function (original) {
      console.log(original);
      // if (Object.keys(original).length > 0) {
      //   // 2. Update if item already exists
      //   return _update(data, original);
      // } else {
      //   // 3. Otherwise, put the item
      //   return _put(data).catch(function (err) {
      //     if (err.code === 'ConditionalCheckFailedException') {
      //       // 3a. Only 1 of the concurrent puts will succeed,
      //       // the rest should retry recursively
      //       return this.upsert(sensorData);
      //     } else {
      //       throw err;
      //     }
      //   });
      // }
    });
  }

  // upsertBatchData(sensorDataList: ParkingSensorData[]) {
  //   const inputs: PutPointInput[] = [];
  //
  //   sensorDataList.forEach(sensorData => {
  //     const input: PutPointInput = {
  //       RangeKeyValue: {S: sensorData.bay_id},
  //       GeoPoint: {
  //         latitude: sensorData.lat,
  //         longitude: sensorData.lon
  //       },
  //       PutItemInput: {
  //         Item: {
  //           streetMarkerId: {S: sensorData.st_marker_id},
  //           bayId: {S: sensorData.bay_id},
  //           status: {S: sensorData.status}
  //         }
  //       }
  //     };
  //     console.dir(input);
  //     inputs.push(input);
  //   });
  //
  //   return this.ddbGeoDataManager.batchWritePoints(inputs).promise()
  //     .then(() => {
  //       console.log('Point added');
  //       return Promise.resolve();
  //     })
  //     .catch(err => {
  //       console.log('Failed to add point', err);
  //       return Promise.reject(err);
  //     });
  // }
}

module.exports = ParkingSensorDataRepo;
