import { AWSError, DynamoDB } from 'aws-sdk';
import { GeoDataManager, GeoTableUtil, GeoDataManagerConfiguration } from 'dynamodb-geo';
import ConfigRepo from './config_repo';
import { GeoPoint } from 'dynamodb-geo/dist/types';

const PARKING_SENSOR_DATA_TABLE = process.env.PARKING_SENSOR_DATA_TABLE;
const UNOCCUPIED = 'Unoccupied';

class ParkingSensorDataRepo {
  private ddb: DynamoDB;
  private ddbGeoConfig: GeoDataManagerConfiguration;
  private ddbGeoDataManager: GeoDataManager;

  constructor() {
    this.ddb = new DynamoDB(ConfigRepo.getDynamoDBConfigs());
    this.ddbGeoConfig = new GeoDataManagerConfiguration(this.ddb, PARKING_SENSOR_DATA_TABLE);
    this.ddbGeoConfig.hashKeyLength = 7;
    this.ddbGeoDataManager = new GeoDataManager(this.ddbGeoConfig);

    this._get = this._get.bind(this);
    this._put = this._put.bind(this);
  }

  createTable() {
    const createTableInput = GeoTableUtil.getCreateTableRequest(this.ddbGeoConfig);
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
        TableName: PARKING_SENSOR_DATA_TABLE,
        // I wonder if dyanmodb-geo would fill the Key for me.
        // It fills the Key for "update" and "add".
        // Typescript type definition demands the Key attribute to be presences
        Key: {
          bay_id: {S: sensorData.bay_id},
          status: {S: sensorData.status}
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

  async upsertAll(sensorDataList: ParkingSensorData[]): Promise<any> {
    try {
      for (let idx = 0; idx < sensorDataList.length; idx++) {
        await this.upsert(sensorDataList[idx]);
        if (idx % 100 === 0) {
          console.log(`inserted ${idx} records`);
        }
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  upsert(sensorData: ParkingSensorData): Promise<any> {
    // 1. Get the original item
    return this._get(sensorData).then((original) => {
      if (Object.keys(original).length > 0) {
        // 2. Update if item already exists
        // return _update(data, original);
      } else {
        // 3. Otherwise, put the item
        return this._put(sensorData).catch((err: AWSError) => {
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

  findUnoccupiedParkingWithinRadius(latitude: number, longitude: number, radiusInMeter: number): Promise<any> {
    const centrePoint: GeoPoint = {latitude: latitude, longitude: longitude};
    return this.ddbGeoDataManager.queryRadius({
      RadiusInMeter: radiusInMeter,
      CenterPoint: centrePoint
    }).then(parkingList => {
      console.log(`Found ${parkingList.length} parking spaces`);
      return Promise.resolve(parkingList.filter(parking => parking.status.S === UNOCCUPIED));
    });
  }
}

export default ParkingSensorDataRepo;
