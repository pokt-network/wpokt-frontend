import { ObjectId } from 'mongodb';

import { dbPromise } from '@/lib/mongodb';
import { CollectionMints, Mint } from '@/types';
import {
  POKT_MULTISIG_ADDRESS,
  WRAPPED_POCKET_ADDRESS,
} from '@/utils/constants';

export const getMintFromId = async (id: string): Promise<Mint | null> => {
  try {
    const client = await dbPromise;

    const mint = await client.collection(CollectionMints).findOne({
      _id: new ObjectId(id),
      wpokt_address: WRAPPED_POCKET_ADDRESS,
      vault_address: POKT_MULTISIG_ADDRESS,
    });

    return mint as Mint | null;
  } catch (error) {
    console.error('Error finding mint:', error);
    return null;
  }
};

export const getAllMints = async (): Promise<Mint[]> => {
  try {
    const client = await dbPromise;

    const mints = await client
      .collection(CollectionMints)
      .find(
        {
          wpokt_address: WRAPPED_POCKET_ADDRESS,
          vault_address: POKT_MULTISIG_ADDRESS,
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
