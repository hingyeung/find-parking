const APP_CONFIG = require('../configs/app_configs.json');
class ConfigRepo {
  config: AppConfig;

  constructor() {
  }

  static _getConfigForThisEnv() {
    if (process.env.AWS_SAM_LOCAL) {
      return APP_CONFIG['sam_local'];
    } else {
      return APP_CONFIG[process.env.NODE_ENV];
    }
  }

  static getMongoDBConfig() {
    const configForThisEnv = ConfigRepo._getConfigForThisEnv();
    return {
      uri: configForThisEnv.mongodb_uri
    };
  }

  static getS3Configs() {
    const configForThisEnv = ConfigRepo._getConfigForThisEnv();
    return {
      endpoint: configForThisEnv.s3Endpoint,
      region: configForThisEnv.region
    };
  }

  static getSSMConfigs() {
    const configForThisEnv = ConfigRepo._getConfigForThisEnv();
    return {
      endpoint: configForThisEnv.ssmEndpoint,
      region: configForThisEnv.region
    };
  }
}

export default ConfigRepo;
