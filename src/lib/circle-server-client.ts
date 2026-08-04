import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

if (!process.env.CIRCLE_API_KEY) {
  console.warn('CIRCLE_API_KEY is not defined in environment variables.');
}

if (!process.env.CIRCLE_ENTITY_SECRET) {
  console.warn('CIRCLE_ENTITY_SECRET is not defined in environment variables.');
}

// Initialize the Circle Server SDK client for Developer-Controlled Wallets
export const circleServer = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || '',
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || '',
});
