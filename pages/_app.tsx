import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from "../theme"
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { goerli, mainnet } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { RainbowKitProvider, getDefaultWallets, darkTheme } from '@rainbow-me/rainbowkit'
import React from 'react';
import { GlobalContextProvider } from '@/context/Globals';
 
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [jsonRpcProvider({
    rpc: (chain) => ({
      http: `https://eth-${chain.name}.gateway.pokt.network/v1/lb/${process.env.POKT_RPC_KEY}`,
      webSocket: `wss://eth-${chain.name}.gateway.pokt.network/v1/lb/${process.env.POKT_RPC_KEY}`
    })
  })],
)

const { connectors } = getDefaultWallets({
  appName: 'wPOKT Bridge',
  projectId: `${process.env.APP_PROJECT_ID}`,
  chains
})
 
const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>POKT Bridge</title>
        <meta name="description" content="Bridge POKT between the Pocket and Ethereum networks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icons/pokt_blue.svg" />
      </Head>
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains} theme={darkTheme({
          accentColor: 'rgba(185, 240, 0, 1)',
          fontStack: 'system',
          overlayBlur: 'small',
          borderRadius: 'small'
        })}>
          <ChakraProvider theme={theme}>
            <GlobalContextProvider>
              {React.createElement(Component, pageProps)}
            </GlobalContextProvider>
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}
