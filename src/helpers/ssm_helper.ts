import ConfigRepo from '../services/config_repo';
import SSM = require('aws-sdk/clients/ssm');
import { SSMGetParameterParam, SSMParameterType, SSMPutParameterParam } from '../types';

const getSSMOptions = () => {
  const options = {
    apiVersion: '2014-11-06'
  };

  return Object.assign({}, options, ConfigRepo.getSSMConfigs());
};

const ssm = new SSM(getSSMOptions());

export const putSSMParameter = (name: string, value: string) => {
  const params: SSMGetParameterParam = {
    Name: name,
    Description: 'description',
    Value: value,
    Overwrite: true,
    Type: SSMParameterType.STRING
  };

  return new Promise((resolve, reject) => {
    ssm.putParameter(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
};

export const getSSMParameter = (name: string): Promise<string> => {
  const params: SSMPutParameterParam = {
    Name: name,
    WithDecryption: true
  };

  return new Promise((resolve, reject) => {
    ssm.getParameter(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data.Parameter.Value);
      }
    });
  });
};