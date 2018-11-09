class ConfigRepo {
  constructor() {
    if (process.env.AWS_SAM_LOCAL) {
        const configFile = "configs/local/config.json";
        console.log(`Loading ${configFile}...`);
        this.config = require(configFile);
    }
  }

  getDynamoDBConfigs() {
    return {
      endpoint: this.config.dynamodbEndpoint,
      region: this.config.region
    };
  }

  getS3Configs() {
    return {
      endpoint: this.config.s3Endpoint,
      region: this.config.region
    };
  }
}

module.exports = ConfigRepo;
