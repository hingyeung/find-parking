const APP_CONFIG = require('../configs/app_configs.json');
class ConfigRepo {
  config: AppConfig;

  constructor() {
  }

  static _getConfigForThisEnv() {
    if (process.env.AWS_SAM_LOCAL) {
      return APP_CONFIG['local'];
    } else {
      return APP_CONFIG[process.env.NODE_ENV];
    }
  }

  static getDynamoDBConfigs() {
    const configForThisEnv = ConfigRepo._getConfigForThisEnv();
    return {
      endpoint: configForThisEnv.dynamodbEndpoint,
      region: configForThisEnv.region
    };
  }

  static getS3Configs() {
    const configForThisEnv = ConfigRepo._getConfigForThisEnv();
    console.log(configForThisEnv);
    return {
      endpoint: configForThisEnv.s3Endpoint,
      region: configForThisEnv.region
    };
  }
}

module.exports = ConfigRepo;
