import { AWSError, DynamoDB } from 'aws-sdk';
import ConfigRepo from './config_repo';
import { ParkingRestrictionData } from '../types';
import { DocumentClient, PutItemInput } from 'aws-sdk/clients/dynamodb';

const PARKING_RESTRICTIONS_DATA_TABLE = process.env.PARKING_RESTRICTIONS_DATA_TABLE;
const CREATE_TABLE_PARAMS = {
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
  private docClient: DocumentClient;

  constructor() {
    this.ddb = new DynamoDB(ConfigRepo.getDynamoDBConfigs());
    this.docClient = new DocumentClient({service: this.ddb});
    this._get = this._get.bind(this);
    this._put = this._put.bind(this);
    this._update = this._update.bind(this);
  }

  createTable() {
    return this.ddb.createTable(CREATE_TABLE_PARAMS).promise()
      .then(() => {
        console.log('Table created and ready!', CREATE_TABLE_PARAMS);
        return Promise.resolve();
      })
      .catch((err: AWSError) => {
        console.log('Failed to create table', CREATE_TABLE_PARAMS, err);
        return Promise.reject(err);
      });
  }

  _get(bayId: string) {
    const getParkingRestrictionByBayIdParam: DocumentClient.GetItemInput = {
      TableName: PARKING_RESTRICTIONS_DATA_TABLE,
      Key: {
        bayId: bayId,
      }
    };
    return this.docClient.get(getParkingRestrictionByBayIdParam).promise();
  }

  _put(parkingRestriction: ParkingRestrictionData) {
    const putParkingRestrictionInput: DocumentClient.PutItemInput = {
      TableName: PARKING_RESTRICTIONS_DATA_TABLE,
      Item: {
        bayId: parkingRestriction.bayId,
        deviceId: parkingRestriction.deviceId,
        description: parkingRestriction.description
      },
      ConditionExpression: 'attribute_not_exists(bayId)'
    };
    return this.docClient.put(putParkingRestrictionInput).promise();
  }

  _update(data: ParkingRestrictionData, bayIdToUpdate: string) {
    const updateExpression = 'SET deviceId = :dId, description = :description';
    const expressionAttributeValues = {
      ':dId': data.deviceId,
      ':description': data.description
    };
    const params = {
      TableName: PARKING_RESTRICTIONS_DATA_TABLE,
      Key: {
        bayId: bayIdToUpdate,
      },
      ReturnValues: 'ALL_NEW',
      ConditionExpression: 'attribute_exists(bayId)',
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues
    };

    if (params.UpdateExpression === '') {
      return Promise.resolve();
    }

    const docClient = this.docClient;
    return new Promise(function (resolve, reject) {
      return docClient.update(params).promise()
        .then(function (result: any) { resolve(result.Attributes.data); })
        .catch(reject);
    });
  }

  upsert(parkingRestriction: ParkingRestrictionData): Promise<any> {
    // 1. Get the original item
    return this._get(parkingRestriction.bayId).then((original) => {
      if (Object.keys(original).length > 0) {
        // 2. Update if item already exists
        return this._update(parkingRestriction, parkingRestriction.bayId);
      } else {
        // 3. Otherwise, put the item
        return this._put(parkingRestriction).catch((err: AWSError) => {
          if (err.code === 'ConditionalCheckFailedException') {
            // 3a. Only 1 of the concurrent puts will succeed,
            // the rest should retry recursively
            return this.upsert(parkingRestriction);
          } else {
            throw err;
          }
        });
      }
    });
  }
}

export default ParkingRestrictionsDataRepo;