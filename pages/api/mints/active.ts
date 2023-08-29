import { NextApiRequest, NextApiResponse } from 'next';

import { getAllMintsFromRecipient } from '@/lib/mint';
import { Status } from '@/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { recipient } = req.query;

  if (typeof recipient !== 'string' || !recipient) return res.status(400).end();

  try {
    console.log("Recipient: ", recipient)
    const mints = await getAllMintsFromRecipient(recipient);
    console.log("Mints: ", mints)

    if (!mints) return res.status(204).end();
    const activeMints = mints.filter((mint) => mint.status !== Status.SUCCESS && mint.status !== Status.FAILED);

    return res.status(200).json(activeMints);
  } catch (error) {
    console.error('Error finding mints:', error);
    return res.status(500).end();
  }
};