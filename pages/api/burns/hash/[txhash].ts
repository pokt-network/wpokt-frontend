import { NextApiRequest, NextApiResponse } from 'next';

import { getBurnFromHash } from '@/lib/burn';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { txhash } = req.query;

  if (typeof txhash !== 'string' || !txhash) return res.status(400).end();

  try {
    const burn = await getBurnFromHash(txhash);

    if (!burn) return res.status(204).end();

    return res.status(200).json(burn);
  } catch (error) {
    console.error('Error finding burn:', error);
    return res.status(500).end();
  }
};
