const APP_CONFIG = require('../configs/app_configs.json');
class ConfigRepo {
  static configForThisEnv = ConfigRepo._getConfigForThisEnv();

  static _getConfigForThisEnv() {
    if (process.env.AWS_SAM_LOCAL) {
      return APP_CONFIG['sam_local'];
    } else {
      return APP_CONFIG[process.env.NODE_ENV];
    }
  }

  static getMongoDBConfig() {
    return {
      uri: ConfigRepo.configForThisEnv.mongodb_uri
    };
  }

  static getS3Configs() {
    return {
      endpoint: ConfigRepo.configForThisEnv.s3Endpoint,
      region: ConfigRepo.configForThisEnv.region
    };
  }

  static getSSMConfigs() {

    return {
      endpoint: ConfigRepo.configForThisEnv.ssmEndpoint,
      region: ConfigRepo.configForThisEnv.region
    };
  }

  static getCORSResponseValue() {
    return ConfigRepo.configForThisEnv.CORSResponseValue;
  }
}

export default ConfigRepo;
