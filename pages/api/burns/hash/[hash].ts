import { NextApiRequest, NextApiResponse } from 'next';

import { getBurnFromHash } from '@/lib/burn';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { hash } = req.query;

  if (typeof hash !== 'string' || !hash) return res.status(400).end();

  try {
    const burn = getBurnFromHash(hash);

    if (!burn) return res.status(204).end();

    return res.status(200).json(burn);
  } catch (error) {
    console.error('Error finding burn:', error);
    return res.status(500).end();
  }
};
