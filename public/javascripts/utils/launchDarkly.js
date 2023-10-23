const LaunchDarkly = require('@launchdarkly/node-server-sdk');

let launchDarklyClient;

async function initialize() {
  const client = LaunchDarkly.init(process.env['LD_sdk_key']);
  await client.waitForInitialization();
  return client;
}

async function getLDClient() {
  if (launchDarklyClient) return launchDarklyClient;
  return (launchDarklyClient = await initialize());
}

module.exports = getLDClient;