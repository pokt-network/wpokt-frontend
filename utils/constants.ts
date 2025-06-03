import { Chain, Hex, getAddress, isAddress } from "viem";
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { mainnet, sepolia } from "wagmi/chains";

export const IS_PAUSED = process.env.NEXT_PUBLIC_PAUSED === "true";

const ETH_RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL;

if (!ETH_RPC_URL) {
  throw new Error(`Missing env variable NEXT_PUBLIC_ETH_RPC_URL`);
}

type SupportedPoktChain = "testnet" | "mainnet";

export const POKT_CHAIN_ID = (process.env.NEXT_PUBLIC_POKT_CHAIN ||
  "testnet") as SupportedPoktChain;

if (POKT_CHAIN_ID !== "testnet" && POKT_CHAIN_ID !== "mainnet") {
  throw new Error(
    `Invalid env variable NEXT_PUBLIC_POKT_CHAIN: ${POKT_CHAIN_ID}`
  );
}

export const POKT_RPC_URL = POKT_CHAIN_ID === "testnet" ? "https://node2.testnet.pokt.network" : `https://pocket-rpc.liquify.com`

export const POKT_MULTISIG_ADDRESS =
  process.env.NEXT_PUBLIC_POKT_MULTISIG_ADDRESS ||
  "EA98FA1BE6E73403CD2F8C70146B0402172307B9";

if (!isAddress("0x" + POKT_MULTISIG_ADDRESS)) {
  throw new Error(
    `Invalid env variable NEXT_PUBLIC_POKT_MULTISIG_ADDRESS: ${POKT_MULTISIG_ADDRESS}`
  );
}


// Ethereum
const ETH_CHAIN_LABEL = (process.env.NEXT_PUBLIC_ETH_CHAIN ||
  "sepolia") as SupportedEthChain;

type SupportedEthChain = "mainnet" | "sepolia";

const ETH_CHAINS: Record<SupportedEthChain, Chain> = {
  mainnet: mainnet,
  sepolia: sepolia,
};

export const CHAIN = ETH_CHAINS[ETH_CHAIN_LABEL];

if (!CHAIN) {
  throw new Error(
    `Invalid env variable NEXT_PUBLIC_ETH_CHAIN: ${ETH_CHAIN_LABEL}`
  );
}

export const ETH_PUBLIC_CLIENT = jsonRpcProvider({
  rpc: () => {
    return {
      http: ETH_RPC_URL,
    };
  },
});

export const ETH_CHAIN_ID = CHAIN.id;

export const WPOKT_ADDRESS = getAddress(
  process.env.NEXT_PUBLIC_WPOKT_ADDRESS ||
  "0x909ef0b6cF52B7cB2B3390F7e8147997E3A2E52D"
);

if (!isAddress(WPOKT_ADDRESS)) {
  throw new Error(
    `Invalid env variable NEXT_PUBLIC_WPOKT_ADDRESS: ${WPOKT_ADDRESS}`
  );
}

export const MINT_CONTROLLER_ADDRESS = getAddress(
  process.env.NEXT_PUBLIC_MINT_CONTROLLER_ADDRESS ||
  "0x488076715Eb6042Bf8Fc5C6cA82CDB630225f1F5"
);

if (!isAddress(MINT_CONTROLLER_ADDRESS)) {
  throw new Error(
    `Invalid env variable NEXT_PUBLIC_MINT_CONTROLLER_ADDRESS: ${MINT_CONTROLLER_ADDRESS}`
  );
}

const CHAINLINK_ETH_USD_ADDRESSES: Record<SupportedEthChain, Hex> = {
  mainnet: getAddress("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"),
  sepolia: getAddress("0x694AA1769357215DE4FAC081bf1f309aDC325306"),
};

export const CHAINLINK_ETH_USD_ADDRESS =
  CHAINLINK_ETH_USD_ADDRESSES[ETH_CHAIN_LABEL];

export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

if (!WALLET_CONNECT_PROJECT_ID) {
  throw new Error(`Missing env variable NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`);
}
