import { NextApiRequest, NextApiResponse } from 'next';

import { getAllMintsFromRecipient } from '@/lib/mint';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { recipient } = req.query;

  if (typeof recipient !== 'string' || !recipient) return res.status(400).end();

  try {
    const mints = await getAllMintsFromRecipient(recipient);

    if (!mints) return res.status(204).end();

    return res.status(200).json(mints);
  } catch (error) {
    console.error('Error finding mints:', error);
    return res.status(500).end();
  }
};