import { NextApiRequest, NextApiResponse } from 'next';

import { getAllHealths } from '@/lib/health';

const getHealth = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const healths = await getAllHealths();

  return res.status(200).json(healths);
};

export default getHealth;
