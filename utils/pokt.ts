import { bech32 } from "bech32";
import { formatUnits, isAddress } from "viem";
import { POKT_RPC_URL } from "./constants";

export function parsePokt(amount: string | number): bigint {
    return BigInt(Number(amount) * 1e6)
}

export function formatPokt(amount: string | bigint): string {
    return formatUnits(BigInt(amount), 6)
}

export const UPOKT = 1000000;

export const STDX_MSG_TYPES = {
    unjail: "pos/MsgUnjail",
    unjail8: "pos/8.0MsgUnjail",
    unstake: "pos/MsgBeginUnstake",
    unstake8: "pos/8.0MsgBeginUnstake",
    stake: "pos/MsgStake",
    send: "pos/Send",
    stake8: "pos/8.0MsgStake",
};

export const poktAddressPrefix = 'pokt';

export function bech32ToHex(address: string): string {
  const decoded = bech32.decode(address);
  if (decoded.prefix !== poktAddressPrefix) {
    return '';
  }
  const hex = Buffer.from(bech32.fromWords(decoded.words)).toString('hex');
  return `0x${hex}`;
}

export function isPoktShannonAddress(address: string): boolean {
  return (
    address.startsWith(poktAddressPrefix) && 
    address.length === 43 && 
    isAddress(bech32ToHex(address))
  )
}

export const PoktGatewayApi = {
  getTx: async (txHash: string): Promise<any> => {
    const res = await fetch(`${POKT_RPC_URL}/cosmos/tx/v1beta1/txs/${txHash}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
    })
    return await res.json()
  },
  getBalance: async (address: string): Promise<any> => {
    const res = await fetch(`${POKT_RPC_URL}/cosmos/bank/v1beta1/balances/${address}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
    })
    return await res.json()
  }
}