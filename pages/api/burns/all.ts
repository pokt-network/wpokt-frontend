import { NextApiRequest, NextApiResponse } from 'next';

import { getAllBurns } from '@/lib/burn';

const findAll = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const burns = await getAllBurns();

  return res.status(200).json(burns);
};

export default findAll;
