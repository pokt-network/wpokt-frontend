import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from '@web3modal/ethereum';
import { configureChains, createClient } from 'wagmi';
import { goerli } from 'wagmi/chains';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error(
    'Invalid/Missing environment variable: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"',
  );
}

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const DEFAULT_CHAIN = goerli;

const chains = [DEFAULT_CHAIN];

const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId }),
]);

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({
    appName: 'web3Modal',
    chains,
  }),
  provider,
});

export const ethereumClient = new EthereumClient(wagmiClient, chains);
