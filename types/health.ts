import { WithId } from 'mongodb';

export const CollectionHealthChecks = 'healthchecks';

export type Health = WithId<{
  pokt_vault_address: string;
  pokt_signers: string[];
  pokt_public_key: string;
  pokt_address: string;
  eth_validators: string[];
  eth_address: string;
  wpokt_address: string;
  hostname: string;
  validator_id: string;
  healthy: boolean;
  created_at: Date;
  service_healths: ServiceHealth[];
}>;

export type ServiceHealth = {
  name: string;
  healthy: boolean;
  eth_block_number: string;
  pokt_height: string;
  last_sync_time: Date;
  next_sync_time: Date;
};
