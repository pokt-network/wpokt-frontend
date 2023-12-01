import { NextApiRequest, NextApiResponse } from 'next';

import { getAllBurnsFromSenderAndOrRecipient } from '@/lib/burn';
import { Status } from '@/types';

const findAll = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { sender, recipient } = req.query;

  if (!sender && !recipient) {
    return res.status(400).end()
  }

  try {
    const burns = await getAllBurnsFromSenderAndOrRecipient(sender as string, recipient as string);

    if (!burns) return res.status(204).end();
    const activeBurns = burns.filter(burn => burn.status !== Status.SUCCESS && burn.status !== Status.FAILED);

    return res.status(200).json(activeBurns);
  } catch (error) {
    console.error('Error finding burns:', error);
    return res.status(500).end();
  }
};

export default findAll;
