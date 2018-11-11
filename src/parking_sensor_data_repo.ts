import { DynamoDB } from 'aws-sdk';
import { GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo';
import { PutPointInput } from 'dynamodb-geo/dist/types';

const AWS = require('aws-sdk');
const ddbGeo = require('dynamodb-geo');
const ConfigRepo = require('./config_repo');

class ParkingSensorDataRepo {
  ddb: DynamoDB;
  ddbGeoConfig: GeoDataManagerConfiguration;
  ddbGeoDataManager: GeoDataManager;

  constructor() {
    const configRepo = new ConfigRepo();
    this.ddb = new AWS.DynamoDB(configRepo.getDynamoDBConfigs());
    this.ddbGeoConfig = new ddbGeo.GeoDataManagerConfiguration(this.ddb, 'ParkingSensorTable');
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

  upsertBatchData(sensorDataList: ParkingSensorData[]) {
    const inputs: PutPointInput[] = [];

    sensorDataList.forEach(sensorData => {
      const input: PutPointInput = {
        RangeKeyValue: {S: sensorData.bay_id},
        GeoPoint: {
          latitude: sensorData.lat,
          longitude: sensorData.lon
        },
        PutItemInput: {
          Item: {
            streetMarkerId: {S: sensorData.st_marker_id},
            bayId: {S: sensorData.bay_id},
            status: {S: sensorData.status}
          }
        }
      };
      console.dir(input);
      inputs.push(input);
    });

    return this.ddbGeoDataManager.batchWritePoints(inputs).promise()
      .then(() => {
        console.log('Point added');
        return Promise.resolve();
      })
      .catch(err => {
        console.log('Failed to add point', err);
        return Promise.reject(err);
      });
  }
}

module.exports = ParkingSensorDataRepo;
