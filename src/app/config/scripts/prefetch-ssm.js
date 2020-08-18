// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

const fs = require('fs');
const RetrieveSSMValues = require('./read-ssm');
const configVarArray = ['auth0-clientId', 'auth0-domain'];
const region = 'us-east-1';
const profile = process.env.AWS_PROFILE;
const stageEnv = process.env.STAGE_ENV;
const AWS_SSM_JSON_PATH = './src/app/config/cla-env-config.json';

async function prefetchSSM() {
  let result = {};
  console.log(`Start to fetch SSM values at ${stageEnv}...`);
  result = await RetrieveSSMValues(configVarArray, stageEnv, region, profile);

  //test for local
  // result['cla-api-url'] = 'http://localhost:5000';
  fs.writeFile(AWS_SSM_JSON_PATH, JSON.stringify(result), function (err) {
    if (err) throw new Error(`Couldn't save SSM paramters to disk with error ${err}`);
    console.log('Fetching completed...');
  });
}

prefetchSSM();
