const APP_CONFIG = require('./configs/app_configs.json');
class ConfigRepo {
  config: AppConfig;

  constructor() {
  }

  _getConfigForThisEnv() {
    if (process.env.AWS_SAM_LOCAL) {
      return APP_CONFIG['local'];
    } else {
      return APP_CONFIG[process.env.NODE_ENV];
    }
  }

  getDynamoDBConfigs() {
    const configForThisEnv = this._getConfigForThisEnv();
    return {
      endpoint: configForThisEnv.dynamodbEndpoint,
      region: configForThisEnv.region
    };
  }

  getS3Configs() {
    const configForThisEnv = this._getConfigForThisEnv();
    return {
      endpoint: configForThisEnv.s3Endpoint,
      region: configForThisEnv.region
    };
  }
}

module.exports = ConfigRepo;
