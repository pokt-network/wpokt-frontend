import { NextApiRequest, NextApiResponse } from 'next';

import { getMintFromId } from '@/lib/mint';

const getMint = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { mintId } = req.query;

  if (typeof mintId !== 'string' || !mintId) return res.status(400).end();

  try {
    const mint = getMintFromId(mintId);

    if (!mint) return res.status(204).end();

    return res.status(200).json(mint);
  } catch (error) {
    console.error('Error finding mint:', error);
    return res.status(500).end();
  }
};

export default getMint;
