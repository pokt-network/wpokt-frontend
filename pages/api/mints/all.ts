import { NextApiRequest, NextApiResponse } from 'next';

import { getAllMints } from '@/lib/mint';

const findAll = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const mints = await getAllMints();

  return res.status(200).json(mints);
};

export default findAll;
