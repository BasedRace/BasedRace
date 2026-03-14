import { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, parseEther, pack } from 'viem';

/**
 * IMPORTANT:
 * In a production environment, this in-memory store is not suitable.
 * It will reset every time the server restarts.
 * Replace this with a persistent database solution like Vercel KV, Redis, or a traditional SQL/NoSQL database.
 */
const userLastClaim = new Map<number, number>();

// --- CONFIGURATION ---
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const CLAIM_AMOUNT_ETH = '100'; // The amount of $RACE tokens to be claimed, in ETH format (e.g., '100').
const CLAIM_COOLDOWN_HOURS = 24;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!ADMIN_PRIVATE_KEY) {
    console.error('CRITICAL: ADMIN_PRIVATE_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error. Unable to sign claims.' });
  }

  const { fid, address } = req.body;

  if (!fid || !address) {
    return res.status(400).json({ error: 'Farcaster ID (fid) and wallet address are required.' });
  }

  // --- COOLDOWN CHECK ---
  const now = Date.now();
  const lastClaimTime = userLastClaim.get(fid);
  if (lastClaimTime && (now - lastClaimTime) < CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000) {
    const hoursRemaining = Math.ceil((lastClaimTime + CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000 - now) / (1000 * 60 * 60));
    return res.status(429).json({ error: `You have already claimed. Try again in ${hoursRemaining} hours.` });
  }

  try {
    const adminAccount = privateKeyToAccount(`0x${ADMIN_PRIVATE_KEY}`);

    const amount = parseEther(CLAIM_AMOUNT_ETH);
    const nonce = BigInt(Date.now()); // Using timestamp as a simple nonce

    // 1. Create the hash that the smart contract will expect.
    // This hash packs the user's address, claim amount, and a unique nonce.
    // The smart contract must construct the *exact* same hash to verify the signature.
    const messageHash = keccak256(
      pack(
        ['address', 'uint256', 'uint256'],
        [address as `0x${string}`, amount, nonce]
      )
    );

    // 2. Sign the hash with the admin's private key.
    // This signature proves that the admin has authorized this specific claim.
    const signature = await adminAccount.signMessage({
      message: { raw: messageHash },
    });

    // --- RECORD THE CLAIM (for cooldown check) ---
    // In a real app, this would be an atomic database transaction.
    userLastClaim.set(fid, now);

    // 3. Return the signature and claim details to the frontend.
    return res.status(200).json({
      signature,
      amount: amount.toString(),
      nonce: nonce.toString(),
    });

  } catch (error: any) {
    console.error('Error generating claim signature:', error);
    return res.status(500).json({ error: 'An error occurred while generating the claim signature.', details: error.message });
  }
}
