import { NextApiRequest, NextApiResponse } from 'next';

import { getAllBurnsFromSenderAndOrRecipient } from '@/lib/burn';

const findAll = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { sender, recipient } = req.query;

  if (!sender && !recipient) {
    return res.status(400).end()
  }

  try {
    const burns = await getAllBurnsFromSenderAndOrRecipient(sender as string, recipient as string);

    if (!burns) return res.status(204).end();

    return res.status(200).json(burns);
  } catch (error) {
    console.error('Error finding burns:', error);
    return res.status(500).end();
  }
};

export default findAll;
