import { ObjectId } from 'mongodb';

import { dbPromise } from '@/lib/mongodb';
import { Burn, CollectionBurns } from '@/types';
import { WPOKT_ADDRESS } from '@/utils/constants';

export const getBurnFromId = async (id: string): Promise<Burn | null> => {
  try {
    const client = await dbPromise;

    const burn = await client.collection(CollectionBurns).findOne({
      _id: new ObjectId(id),
      wpokt_address: WPOKT_ADDRESS,
    });

    return burn as Burn | null;
  } catch (error) {
    console.error('Error finding burn:', error);
    return null;
  }
};

export const getAllBurns = async (): Promise<Burn[]> => {
  try {
    const client = await dbPromise;

    const burns = await client
      .collection(CollectionBurns)
      .find(
        {
          wpokt_address: WPOKT_ADDRESS,
        },
        { sort: { created_at: -1 } },
      )
      .toArray();

    return burns as Burn[];
  } catch (error) {
    console.error('Error finding burns:', error);
    return [];
  }
};
