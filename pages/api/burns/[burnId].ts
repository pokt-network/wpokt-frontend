import { NextApiRequest, NextApiResponse } from 'next';

import { getBurnFromId } from '@/lib/burn';

const getBurn = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { burnId } = req.query;

  if (typeof burnId !== 'string' || !burnId) return res.status(400).end();

  try {
    const burn = getBurnFromId(burnId);

    if (!burn) return res.status(204).end();

    return res.status(200).json(burn);
  } catch (error) {
    console.error('Error finding burn:', error);
    return res.status(500).end();
  }
};

export default getBurn;
