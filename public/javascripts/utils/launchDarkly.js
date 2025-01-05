import LaunchDarkly from '@launchdarkly/node-server-sdk';

let launchDarklyClient;

async function initialize() {
  const client = LaunchDarkly.init(process.env.LD_SDK_KEY);
  await client.waitForInitialization();
  return client;
}

async function getLDClient() {
  if (launchDarklyClient) return launchDarklyClient;
  return (launchDarklyClient = await initialize());
}

export default getLDClient;
