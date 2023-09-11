const validators = {
  GATEWAY_BASE_URL: (value: any, config: any) => {
    const isEmpty = value === "";

    if (isEmpty) {
      throw new Error("Required configuration environment variable GATEWAY_BASE_URL, received none");
    }

    const isLocalhostUrl = value.includes("localhost");

    if (isLocalhostUrl) {
      return value;
    }

    const isOfficialDomainUrl = value.includes("gateway.pokt.network");
    const hasChainIdSubdomain = !value.includes("http://gateway.pokt") && !value.includes("https://gateway.pokt");

    if (isOfficialDomainUrl && !hasChainIdSubdomain) {
      console.warn("Expecting configuration environment variable GATEWAY_BASE_URL to respect the following format: `https://{CHAIN_ID}.{GATEWAY_DOMAIN}`, but received invalid URL");
      console.warn("Constructing proper URL...");

      const gatewayDomainUrl = value.split("://")[1];
      console.log(gatewayDomainUrl);
      const constructedGatewayUrl = `https://${config.CHAIN_ID}.${gatewayDomainUrl}`;

      console.log("constructed:", constructedGatewayUrl);

      return constructedGatewayUrl;
    }

    return value;
  },
  CHAIN_ID: (value: any) => {
    const isEmpty = value === "";

    if (isEmpty) {
      throw new Error("Required configuration environment variable CHAIN_ID, received none");
    }

    return value;
  }
}


const configEnvVars = [
  'NEXT_PUBLIC_CLIENT_PASSPHRASE',
  'NEXT_PUBLIC_CLIENT_PUBLIC_KEY',
  'NEXT_PUBLIC_CLIENT_PRIVATE_KEY',
  'NEXT_PUBLIC_WALLET_APP_PUBLIC_KEY',
  'NEXT_PUBLIC_WALLET_APP_AAT_SIGNATURE',
  'NEXT_PUBLIC_POKT_USD_VALUE',
  'NEXT_PUBLIC_SECURE_LS_ENCRYPTION_SECRET',
  'NEXT_PUBLIC_SECURE_LS_ENCODING_TYPE',
  'NEXT_PUBLIC_SECURE_LS_IS_COMPRESSION',
  'NEXT_PUBLIC_DISPATCHERS',
  'NEXT_PUBLIC_HTTP_PROVIDER',
  'NEXT_PUBLIC_AAT_VERSION',
  'NEXT_PUBLIC_MAX_DISPATCHERS',
  'NEXT_PUBLIC_PROVIDER_TYPE',
  'NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL',
  'NEXT_PUBLIC_DASHBOARD_BASE_URL',
  'NEXT_PUBLIC_BUY_POKT_BASE_URL',
  'NEXT_PUBLIC_CHAIN',
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_BLOCK_TIME',
  'NEXT_PUBLIC_MAX_TRANSACTION_LIST_COUNT',
  'NEXT_PUBLIC_TX_FEE',
  'NEXT_PUBLIC_SESSION_LENGTH',
  'NEXT_PUBLIC_GATEWAY_BASE_URL',
  'NEXT_PUBLIC_HTTP_TIMEOUT',
  'NEXT_PUBLIC_HTTP_HEADERS',
  'NEXT_PUBLIC_USE_LEGACY_CODEC'
]

const loadEnvFromList = (list: any[]) => list.reduce(
  (cfg, k) => {
     return { ...cfg, [k.replace(/NEXT_PUBLIC_/g, '')]: import.meta.env[k] }
  },
  {},
)

/**
 * For now the config is literraly = env variables
 * keep this piece of code if we want to do config gymnastics
 * */
const loadConfigFromEnv = () => {
  const configObj = loadEnvFromList(configEnvVars);

  // order of values matters!
  const validatedEnvVars = ['CHAIN_ID', 'GATEWAY_BASE_URL']

  validatedEnvVars.forEach(
    (envVarKey) => {
      console.log({ envVarKey, envVarVal: configObj[envVarKey] })
      const v = validators[envVarKey](configObj[envVarKey], configObj); // as long as it does not through we are good
      configObj[envVarKey] = v;
    }
  );

  return configObj;
}

export const Config = loadConfigFromEnv();