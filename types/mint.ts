export const CollectionMints = "mints";

import { WithId } from 'mongodb';
import { Status } from './status';

export type Maybe<T> = T | null | undefined;

export type MintMemo = {
  address: string;
  chain_id: string;
};

export type MintData = {
  recipient: string;
  amount: string;
  nonce: string;
};

export type Mint = WithId<{
  transaction_hash: string;
  height: string;
  confirmations: string;
  sender_address: string;
  sender_chain_id: string;
  recipient_address: string;
  recipient_chain_id: string;
  wpokt_address: string;
  vault_address: string;
  amount: string;
  nonce: string;
  memo: Maybe<MintMemo>;
  created_at: Date;
  updated_at: Date;
  status: Status;
  data: Maybe<MintData>;
  signers: string[];
  signatures: string[];
  mint_tx_hash: string;

}>;
