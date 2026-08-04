import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';

// Load existing environment variables
dotenv.config();

async function main() {
  console.log('Generating new Entity Secret...');
  
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    console.error('ERROR: CIRCLE_API_KEY is not set in your .env file.');
    console.error('Please generate a standard API Key (not a Kit Key) in the Circle Console and add it.');
    process.exit(1);
  }

  // 1. Generate a 32-byte hex string
  const entitySecret = crypto.randomBytes(32).toString('hex');
  console.log('[Success] Generated Raw Entity Secret');

  // 2. Setup Recovery File Directory
  const OUTPUT_DIR = path.join(process.cwd(), 'secrets');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Registering Entity Secret with Circle via API...');
  
  try {
    // 3. Use the SDK to automatically encrypt, register, and download the recovery file
    const response = await registerEntitySecretCiphertext({
      apiKey,
      entitySecret,
      recoveryFileDownloadPath: OUTPUT_DIR,
    });
    
    console.log('[Success] Successfully registered Entity Secret!');
    console.log(`[Success] Recovery file saved to: ${OUTPUT_DIR} (KEEP THIS SAFE!)`);
    
    // Automatically append to .env
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    if (!envContent.includes('CIRCLE_ENTITY_SECRET')) {
      fs.appendFileSync(envPath, `\nCIRCLE_ENTITY_SECRET="${entitySecret}"\n`);
      console.log('[Success] Successfully appended CIRCLE_ENTITY_SECRET to your .env file.');
    } else {
      console.log('[Warning] CIRCLE_ENTITY_SECRET already exists in your .env file. Update it manually if needed.');
    }

  } catch (error) {
    console.error('Failed to register Entity Secret:', error);
  }

main().catch(console.error);
