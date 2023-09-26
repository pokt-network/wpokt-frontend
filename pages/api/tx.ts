import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
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
        address: address,
        raw_hex_bytes: raw_hex_bytes,
      })
    })
    
    const result = await response.json()
    console.log(result)

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error sending tx:', error);
    return res.status(500).end();
  }
};