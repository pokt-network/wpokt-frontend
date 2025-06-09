import { ETH_CHAINS } from "./constants"
import { SupportedEthChain, SupportedPoktChain } from "./types"

export function isValidEthAddress(address: string): boolean {
  const characters = "0123456789abcdefABCDEF".split("")
  const invalidChars = address.substring(2).split("").filter(c => !characters.includes(c))
  if (address.length === 42 && address.startsWith("0x") && !invalidChars.length) {
    return true
  }
  return false
}

export function getPoktScanTxUrl(chain: SupportedPoktChain, poktTxHash: string): string {
  const hash = poktTxHash.startsWith("0x") ? poktTxHash.substring(2) : poktTxHash
  switch (chain) {
    case "testnet":
      return `https://poktscan.com/testnet/tx/${hash}`
    case "mainnet":
      return `https://explorer.pocket.network/pocket-mainnet/tx/${hash}`
    case "pocket-beta":
      return `https://explorer.pocket.network/pocket-beta/tx/${hash}`
    default:
      return `https://poktscan.com/tx/${hash}`
  }
}

export function getEtherscanTxUrl(chain: number | SupportedEthChain, ethTxHash: string): string {
  const chainLabel = typeof chain === "number" ? Object.entries(ETH_CHAINS).find(([_, value]) => value.id === chain)?.[0] : chain
  switch (chainLabel) {
    case "mainnet":
      return `https://etherscan.io/tx/${ethTxHash}`
    case "sepolia":
      return `https://sepolia.etherscan.io/tx/${ethTxHash}`
    default:
      return `https://etherscan.io/tx/${ethTxHash}`
  }
}