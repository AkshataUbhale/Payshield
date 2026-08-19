import nacl from "tweetnacl";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

export interface ArbitrationVerdict {
  disputeId?: string | undefined;
  projectName: string;
  milestoneName: string;
  clientPercent: number;
  freelancerPercent: number;
  rulingSummary: string;
  timestamp: number;
}

export interface SignedVerdict {
  verdict: ArbitrationVerdict;
  oraclePubkey: string;
  signature: string;
  verified: boolean;
}

export class AIOracleService {
  private static keyPair: nacl.SignKeyPair | null = null;

  /**
   * Get or initialize the AI Oracle Ed25519 Keypair
   */
  public static getKeyPair(): nacl.SignKeyPair {
    if (this.keyPair) return this.keyPair;

    const secretKeyEnv = process.env.AI_ORACLE_SECRET_KEY;
    if (secretKeyEnv) {
      try {
        const secretBytes = bs58.decode(secretKeyEnv);
        if (secretBytes.length === 64) {
          this.keyPair = nacl.sign.keyPair.fromSecretKey(secretBytes);
          return this.keyPair;
        } else if (secretBytes.length === 32) {
          this.keyPair = nacl.sign.keyPair.fromSeed(secretBytes);
          return this.keyPair;
        }
      } catch (err) {
        console.warn("Failed to parse AI_ORACLE_SECRET_KEY from env, generating deterministic fallback:", err);
      }
    }

    // Deterministic 32-byte seed for PayShield AI Oracle
    const seed = new Uint8Array(32);
    const seedStr = "payshield-ai-oracle-ed25519-seed-2026";
    for (let i = 0; i < 32; i++) {
      seed[i] = seedStr.charCodeAt(i % seedStr.length) ^ (i * 7);
    }
    this.keyPair = nacl.sign.keyPair.fromSeed(seed);
    return this.keyPair;
  }

  /**
   * Get the public key of the AI Oracle in base58 format
   */
  public static getOraclePublicKey(): string {
    const kp = this.getKeyPair();
    return bs58.encode(kp.publicKey);
  }

  /**
   * Cryptographically sign an arbitration verdict using Ed25519 detached signature
   */
  public static signArbitrationVerdict(verdictData: {
    disputeId?: string | undefined;
    projectName: string;
    milestoneName: string;
    clientPercent: number;
    freelancerPercent: number;
    rulingSummary: string;
  }): SignedVerdict {
    const kp = this.getKeyPair();
    const verdict: ArbitrationVerdict = {
      ...verdictData,
      timestamp: Date.now(),
    };

    const canonicalVerdictStr = JSON.stringify({
      disputeId: verdict.disputeId || "DISPUTE-LIVE",
      projectName: verdict.projectName,
      milestoneName: verdict.milestoneName,
      clientPercent: verdict.clientPercent,
      freelancerPercent: verdict.freelancerPercent,
      rulingSummary: verdict.rulingSummary.slice(0, 300),
      timestamp: verdict.timestamp,
    });

    const verdictBytes = new TextEncoder().encode(canonicalVerdictStr);
    const signatureBytes = nacl.sign.detached(verdictBytes, kp.secretKey);
    const signature = bs58.encode(signatureBytes);
    const oraclePubkey = bs58.encode(kp.publicKey);

    return {
      verdict,
      oraclePubkey,
      signature,
      verified: nacl.sign.detached.verify(verdictBytes, signatureBytes, kp.publicKey),
    };
  }

  /**
   * Verify an arbitration verdict signature
   */
  public static verifyVerdictSignature(
    canonicalPayload: string,
    signatureBase58: string,
    pubkeyBase58: string
  ): boolean {
    try {
      const messageBytes = new TextEncoder().encode(canonicalPayload);
      const signatureBytes = bs58.decode(signatureBase58);
      const pubkeyBytes = bs58.decode(pubkeyBase58);
      return nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
    } catch {
      return false;
    }
  }
}
