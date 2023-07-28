import { WithId } from 'mongodb';
import { Status } from './status';

export const CollectionBurns = 'burns';

export type Burn = WithId<{
  transaction_hash: string;
  log_index: string;
  block_number: string;
  confirmations: string;
  sender_address: string;
  sender_chain_id: string;
  recipient_address: string;
  recipient_chain_id: string;
  wpokt_address: string;
  amount: string;
  created_at: Date;
  updated_at: Date;
  status: Status;
  return_tx: string;
  signers: string[];
  return_tx_hash: string;
}>;
