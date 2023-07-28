import { dbPromise } from '@/lib/mongodb';
import { CollectionHealthChecks, Health } from '@/types';

export const getAllHealths = async (): Promise<Health[]> => {
  try {
    const client = await dbPromise;

    const healths = await client
      .collection(CollectionHealthChecks)
      .find({}, { sort: { validator_id: 1 } })
      .toArray();

    return healths as Health[];
  } catch (error) {
    console.error('Error finding healths:', error);
    return [];
  }
};
