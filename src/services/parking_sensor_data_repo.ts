import { AWSError, DynamoDB } from 'aws-sdk';
import { GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo';
import { PutPointInput, GetPointInput } from 'dynamodb-geo/dist/types';

const ddbGeo = require('dynamodb-geo');
const ConfigRepo = require('./config_repo');
const PARKING_SENSOR_DATA_TABLE_NAME = 'ParkingSensorTable';

class ParkingSensorDataRepo {
  private ddb: DynamoDB;
  private ddbGeoConfig: GeoDataManagerConfiguration;
  private ddbGeoDataManager: GeoDataManager;

  constructor() {
    this.ddb = new DynamoDB(ConfigRepo.getDynamoDBConfigs());
    this.ddbGeoConfig = new ddbGeo.GeoDataManagerConfiguration(this.ddb, PARKING_SENSOR_DATA_TABLE_NAME);
    this.ddbGeoConfig.hashKeyLength = 7;
    this.ddbGeoDataManager = new ddbGeo.GeoDataManager(this.ddbGeoConfig);

    this._get = this._get.bind(this);
    this._put = this._put.bind(this);
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
      RangeKeyValue: {S: sensorData.bay_id},
      GeoPoint: {latitude: sensorData.lat, longitude: sensorData.lon},
      GetItemInput: {
        TableName: PARKING_SENSOR_DATA_TABLE_NAME,
        // I wonder if dyanmodb-geo would fill the Key for me.
        // It fills the Key for "update" and "add".
        // Typescript type definition demands the Key attribute to be presences
        Key: {
          bay_id: { S: sensorData.bay_id },
          status: { S: sensorData.status }
        }
      }
    };
    return this.ddbGeoDataManager.getPoint(getPointInput).promise();
  }

  _put(sensorData: ParkingSensorData) {
    const putPointInput = {
      RangeKeyValue: {S: sensorData.bay_id},
      GeoPoint: {latitude: sensorData.lat, longitude: sensorData.lon},
      PutItemInput: {
        Item: {
          bay_id: { S: sensorData.bay_id },
          status: { S: sensorData.status }
        }
      },
      ConditionExpression: 'attribute_not_exists(partitionKey) AND attribute_not_exists(sortKey)'
    };
    return this.ddbGeoDataManager.putPoint(putPointInput).promise();
  }

  upsert(sensorData: ParkingSensorData): Promise<any> {
    // 1. Get the original item
    return this._get(sensorData).then((original) => {
      console.log(original);
      if (Object.keys(original).length > 0) {
        console.log('original found, perform update');
        // 2. Update if item already exists
        // return _update(data, original);
      } else {
        // 3. Otherwise, put the item
        console.log('original not found, perform put');
        return this._put(sensorData).catch( (err: AWSError) => {
          if (err.code === 'ConditionalCheckFailedException') {
            // 3a. Only 1 of the concurrent puts will succeed,
            // the rest should retry recursively
            return this.upsert(sensorData);
          } else {
            throw err;
          }
        });
      }
    });
  }
}

module.exports = ParkingSensorDataRepo;
