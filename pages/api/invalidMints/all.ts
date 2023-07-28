import { NextApiRequest, NextApiResponse } from 'next';

import { getAllInvalidMints } from '@/lib/invalidMint';

const findAll = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  const invalidMints = await getAllInvalidMints();

  return res.status(200).json(invalidMints);
};

export default findAll;
