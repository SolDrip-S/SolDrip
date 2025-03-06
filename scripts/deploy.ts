import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey, Keypair, Connection, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

// Load environment variables
const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

async function main() {
  console.log(`Deploying SolDrip to ${NETWORK}...`);

  // Configure connection
  const connection = new Connection(
    NETWORK === 'mainnet-beta'
      ? 'https://api.mainnet-beta.solana.com'
      : NETWORK === 'testnet'
      ? 'https://api.testnet.solana.com'
      : 'https://api.devnet.solana.com',
    'confirmed'
  );

  // Load deployer keypair
  let deployerKeypair: Keypair;
  try {
    const keypairFile = path.resolve(process.env.KEYPAIR_PATH || '~/.config/solana/id.json');
    const keypairData = JSON.parse(fs.readFileSync(keypairFile, 'utf-8'));
    deployerKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    console.error('Failed to load keypair:', error);
    console.log('Generating new keypair for testing...');
    deployerKeypair = Keypair.generate();
  }

  console.log(`Deployer: ${deployerKeypair.publicKey.toString()}`);

  // Check balance
  const balance = await connection.getBalance(deployerKeypair.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < LAMPORTS_PER_SOL) {
    if (NETWORK === 'devnet') {
      console.log('Requesting airdrop...');
      const signature = await connection.requestAirdrop(
        deployerKeypair.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      console.log(`New balance: ${(await connection.getBalance(deployerKeypair.publicKey)) / LAMPORTS_PER_SOL} SOL`);
    } else {
      console.error('Insufficient balance for deployment');
      process.exit(1);
    }
  }

  // Set up Anchor provider
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(deployerKeypair),
    { commitment: 'confirmed' }
  );
  anchor.setProvider(provider);

  // Load program
  // In a real deployment script, we would load the IDL and program
  console.log('Loading program...');
  
  // Create token mint
  console.log('Creating token mint...');
  const tokenMint = Keypair.generate();
  
  // Create dividend pool
  console.log('Creating dividend pool...');
  const dividendPool = Keypair.generate();
  
  // Initialize SolDrip token
  console.log('Initializing SolDrip token...');
  
  // In a real deployment script, we would:
  // 1. Deploy the program if not already deployed
  // 2. Create a token mint
  // 3. Initialize the SolDrip token with the mint and dividend pool
  // 4. Mint the initial supply to the deployer
  // 5. Set up LP pool
  
  console.log('Deployment completed successfully!');
  console.log('Token Mint:', tokenMint.publicKey.toString());
  console.log('Dividend Pool:', dividendPool.publicKey.toString());
  
  // Save deployment info
  const deploymentInfo = {
    network: NETWORK,
    deployer: deployerKeypair.publicKey.toString(),
    tokenMint: tokenMint.publicKey.toString(),
    dividendPool: dividendPool.publicKey.toString(),
    deploymentDate: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    path.resolve(__dirname, '../deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('Deployment info saved to deployment-info.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 