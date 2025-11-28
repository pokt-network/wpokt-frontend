export type SupportedEthChain = "mainnet" | "sepolia";

export type SupportedPoktChain = "testnet" | "mainnet" | "pocket-beta";

export interface SignedPocketShannonTransaction {
  fee: string
rawTx: string
signature: string
transactionHex: string
}