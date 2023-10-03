import { POKT_RPC_URL, POKT_CHAIN_ID } from "@/utils/constants";

// Description: Configuration file for the Pocket Network data source.
export const Config = {
  AAT_VERSION: '1.0',
  MAX_DISPATCHERS: '1',
  BLOCK_EXPLORER_BASE_URL: 'https://explorer.pokt.network',
  DASHBOARD_BASE_URL: 'https://mainnet.dashboard.pokt.network',
  CHAIN: '0001',
  CHAIN_ID: POKT_CHAIN_ID,
  BLOCK_TIME: '900000',
  MAX_TRANSACTION_LIST_COUNT: '100',
  TX_FEE: '10000',
  SESSION_LENGTH: '30',
  GATEWAY_BASE_URL: POKT_RPC_URL,
  HTTP_TIMEOUT: '0',
  HTTP_HEADERS: '{"Content-Type": "application/json"}',
  USE_LEGACY_CODEC: 'false',
}
