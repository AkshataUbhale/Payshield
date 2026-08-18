import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
const connection = new Connection(RPC_URL, "confirmed");

export interface SolanaTxStatus {
  signature: string;
  confirmed: boolean;
  slot?: number | undefined;
  blockTime?: string | undefined;
  fee?: number | undefined;
  err?: string | null | undefined;
  logMessages?: string[] | undefined;
  statusText: string;
}

export interface SolanaWalletBalance {
  address: string;
  solBalance: number;
  lamports: number;
  executable: boolean;
  rentEpoch?: number | undefined;
}

export interface SolanaEscrowState {
  escrowAddress: string;
  exists: boolean;
  lamports: number;
  solAmount: number;
  owner: string;
  dataSize: number;
  status: "LOCKED_IN_ESCROW" | "NOT_FOUND" | "COMPLETED";
}

export class SolanaRPCTools {
  /**
   * Tool: Query transaction status and logs directly from Solana ledger
   */
  public static async getTransactionStatus(signature: string): Promise<SolanaTxStatus> {
    try {
      const cleanSig = signature.trim();
      const statusResponse = await connection.getSignatureStatus(cleanSig, {
        searchTransactionHistory: true,
      });

      if (!statusResponse || !statusResponse.value) {
        return {
          signature: cleanSig,
          confirmed: false,
          statusText: "Transaction not found on ledger yet. It may still be processing in the mempool or dropped.",
        };
      }

      const val = statusResponse.value;
      const isConfirmed = val.confirmationStatus === "confirmed" || val.confirmationStatus === "finalized";

      let logs: string[] = [];
      let fee = 0;
      let blockTimeStr: string | undefined = undefined;

      try {
        const tx = await connection.getTransaction(cleanSig, {
          maxSupportedTransactionVersion: 0,
        });
        if (tx) {
          logs = tx.meta?.logMessages || [];
          fee = (tx.meta?.fee || 0) / LAMPORTS_PER_SOL;
          if (tx.blockTime) {
            blockTimeStr = new Date(tx.blockTime * 1000).toISOString();
          }
        }
      } catch {
        // Logs optional
      }

      return {
        signature: cleanSig,
        confirmed: isConfirmed,
        slot: val.slot,
        blockTime: blockTimeStr,
        fee,
        err: val.err ? JSON.stringify(val.err) : null,
        logMessages: logs.slice(0, 5),
        statusText: isConfirmed
          ? `Transaction successfully confirmed at slot ${val.slot} with status '${val.confirmationStatus}'.`
          : `Transaction pending with status '${val.confirmationStatus}'.`,
      };
    } catch (error: any) {
      return {
        signature,
        confirmed: false,
        err: error.message,
        statusText: `Error querying Solana RPC: ${error.message}`,
      };
    }
  }

  /**
   * Tool: Query wallet balance
   */
  public static async getWalletBalance(walletAddress: string): Promise<SolanaWalletBalance> {
    try {
      const pubkey = new PublicKey(walletAddress.trim());
      const balanceLamports = await connection.getBalance(pubkey);
      const accountInfo = await connection.getAccountInfo(pubkey);

      return {
        address: walletAddress,
        solBalance: balanceLamports / LAMPORTS_PER_SOL,
        lamports: balanceLamports,
        executable: accountInfo?.executable || false,
        rentEpoch: accountInfo?.rentEpoch,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch wallet balance for ${walletAddress}: ${error.message}`);
    }
  }

  /**
   * Tool: Query escrow account state and deposited funds
   */
  public static async getEscrowAccountInfo(escrowPdaAddress: string): Promise<SolanaEscrowState> {
    try {
      const pdaPubkey = new PublicKey(escrowPdaAddress.trim());
      const accountInfo = await connection.getAccountInfo(pdaPubkey);

      if (!accountInfo) {
        return {
          escrowAddress: escrowPdaAddress,
          exists: false,
          lamports: 0,
          solAmount: 0,
          owner: "None",
          dataSize: 0,
          status: "NOT_FOUND",
        };
      }

      const solAmount = accountInfo.lamports / LAMPORTS_PER_SOL;

      return {
        escrowAddress: escrowPdaAddress,
        exists: true,
        lamports: accountInfo.lamports,
        solAmount,
        owner: accountInfo.owner.toBase58(),
        dataSize: accountInfo.data.length,
        status: solAmount > 0 ? "LOCKED_IN_ESCROW" : "COMPLETED",
      };
    } catch (error: any) {
      throw new Error(`Failed to query Escrow PDA ${escrowPdaAddress}: ${error.message}`);
    }
  }

  /**
   * Tool: Network Health Check
   */
  public static async getNetworkStatus(): Promise<{
    cluster: string;
    currentSlot: number;
    blockHeight: number;
    health: string;
  }> {
    const slot = await connection.getSlot();
    const blockHeight = await connection.getBlockHeight();
    return {
      cluster: RPC_URL.includes("devnet") ? "Devnet" : "Mainnet-Beta",
      currentSlot: slot,
      blockHeight,
      health: "OK",
    };
  }
}
