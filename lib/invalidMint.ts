import { ObjectId } from 'mongodb';

import { dbPromise } from '@/lib/mongodb';
import { CollectionInvalidMints, InvalidMint } from '@/types';
import { POKT_MULTISIG_ADDRESS } from '@/utils/constants';

export const getInvalidMintFromId = async (
  id: string,
): Promise<InvalidMint | null> => {
  try {
    const client = await dbPromise;

    const invalid_mint = await client
      .collection(CollectionInvalidMints)
      .findOne({ _id: new ObjectId(id), vault_address: POKT_MULTISIG_ADDRESS });

    return invalid_mint as InvalidMint | null;
  } catch (error) {
    console.error('Error finding invalid mint:', error);
    return null;
  }
};

export const getInvalidMintFromTx = async (
  transaction_hash: string,
): Promise<InvalidMint | null> => {
  try {
    const client = await dbPromise;

    const invalid_mint = await client
      .collection(CollectionInvalidMints)
      .findOne({ vault_address: POKT_MULTISIG_ADDRESS, transaction_hash });

    return invalid_mint as InvalidMint | null;
  } catch (error) {
    console.error('Error finding invalid mint:', error);
    return null;
  }
};

export const getAllInvalidMints = async (): Promise<InvalidMint[]> => {
  try {
    const client = await dbPromise;

    const invalid_mints = await client
      .collection(CollectionInvalidMints)
      .find(
        {
          vault_address: POKT_MULTISIG_ADDRESS,
        },
        { sort: { created_at: -1 } },
      )
      .toArray();

    return invalid_mints as InvalidMint[];
  } catch (error) {
    console.error('Error finding invalid mints:', error);
    return [];
  }
};
