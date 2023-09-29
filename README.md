# wPOKT Bridge
A frontend application for bridging POKT between Pocket Network and Ethereum mainnet.

## Configurations
### Environment Variables
The env variables are stored in `.env.local` file. You can copy the relevant variables from `.env.example` file. The variables are as follows:
- `APP_PROJECT_ID`: The Wallet Connect app ID key.
- `MONGODB_URI`: The connection URI for Mongo DB.
- `MONGODB_DATABASE`: The name of the database to use.
- `POKT_RPC_KEY`: API key for Pocket Network RPC gateway.

### Constants
These are public constant values that are chain dependent. They can be found in `utils/constants.ts` file. There are also POKT gateway configs found in `datasource/config.js`. It is hardcoded for Pocket mainnet and only used for those connecting to the dapp and bridging from their Ledger hardware wallet. None of the values in those files should be altered unless one of the chains is changed or doing testnet/local development.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
