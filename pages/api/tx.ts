import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

const cors = Cors({
  methods: ['POST'],
  // origin: '*',
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);
  if (req.method !== 'POST') return res.status(405).end();

  const { address, raw_hex_bytes } = req.body;
  console.log({ address, raw_hex_bytes })

  try {
    const response = await fetch(`https://mainnet.gateway.pokt.network/v1/lb/${process.env.POKT_RPC_KEY}/v1/client/rawtx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Blockchain-Subdomain": "mainnet"
      },
      body: JSON.stringify({
        address: address.toString("hex"),
        raw_hex_bytes: raw_hex_bytes.toString("hex"),
      })
    })
    
    const result = await response.json()
    console.log(result)
    if (result.raw_log) throw new Error(result.raw_log);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error sending tx:', error);
    return res.status(500).end();
  }
};