import { WithId } from 'mongodb';
import { Status } from './status';

export const CollectionInvalidMints = 'invalidMints';

export type InvalidMint = WithId<{
  transaction_hash: string;
  height: string;
  confirmations: string;
  sender_address: string;
  sender_chain_id: string;
  vault_address: string;
  amount: string;
  created_at: Date;
  updated_at: Date;
  status: Status;
  return_tx: string;
  signers: string[];
  return_tx_hash: string;
  memo: string;
}>;
