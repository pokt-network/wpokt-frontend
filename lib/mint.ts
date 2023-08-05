import { ObjectId } from 'mongodb';

import { dbPromise } from '@/lib/mongodb';
import { CollectionMints, Mint, Status } from '@/types';
import {
  POKT_MULTISIG_ADDRESS,
  WPOKT_ADDRESS,
} from '@/utils/constants';

export const getMintFromId = async (id: string): Promise<Mint | null> => {
  try {
    const client = await dbPromise;

    const mint = await client.collection(CollectionMints).findOne({
      _id: new ObjectId(id),
      wpokt_address: WPOKT_ADDRESS,
      vault_address: POKT_MULTISIG_ADDRESS,
    });

    return mint as Mint | null;
  } catch (error) {
    console.error('Error finding mint:', error);
    return null;
  }
};

export const getMintFromPoktTx = async (txHash: string): Promise<Mint | null> => {
  try {
    const client = await dbPromise;

    const mint = await client.collection(CollectionMints).findOne({
      wpokt_address: WPOKT_ADDRESS,
      vault_address: POKT_MULTISIG_ADDRESS,
      transaction_hash: txHash,
    });

    return mint as Mint | null;
  } catch (error) {
    console.error('Error finding mint:', error);
    return null;
  }
};

export const getAllMintsFromRecipient = async (ethAddress: string): Promise<Mint[]> => {
  try {
    const client = await dbPromise;

    const mints = await client
      .collection(CollectionMints)
      .find(
        {
          wpokt_address: WPOKT_ADDRESS,
          vault_address: POKT_MULTISIG_ADDRESS,
          recipient_address: ethAddress,
        },
        { sort: { created_at: -1 } },
      )
      .toArray();

    return mints as Mint[];
  } catch (error) {
    console.error('Error finding mints:', error);
    return [];
  }
};