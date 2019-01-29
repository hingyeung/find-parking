import { AWSError, DynamoDB } from 'aws-sdk';
import ConfigRepo from './config_repo';

const PARKING_RESTRICTIONS_DATA_TABLE = process.env.PARKING_RESTRICTIONS_DATA_TABLE;
const DB_PARAMS = {
  AttributeDefinitions: [
    {
      AttributeName: 'bayId',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'bayId',
      KeyType: 'HASH'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: PARKING_RESTRICTIONS_DATA_TABLE,
  StreamSpecification: {
    StreamEnabled: false
  }
};

class ParkingRestrictionsDataRepo {
  private ddb: DynamoDB;

  constructor() {
    this.ddb = new DynamoDB(ConfigRepo.getDynamoDBConfigs());
  }

  createTable() {
    return this.ddb.createTable(DB_PARAMS).promise()
      .then(() => {
        console.log('Table created and ready!');
        return Promise.resolve();
      })
      .catch((err: AWSError) => {
        console.log('Failed to create table', DB_PARAMS, err);
        return Promise.reject(err);
      });
  }
}

export default ParkingRestrictionsDataRepo;