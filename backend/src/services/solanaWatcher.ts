import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../config/solana.js";
import Project from "../models/Project.js";

export const startSolanaWatcher = () => {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  console.log(`Starting Solana Watcher on ${rpcUrl}...`);
  console.log(`Watching Program ID: ${PROGRAM_ID.toBase58()}`);

  try {
    connection.onProgramAccountChange(
      PROGRAM_ID,
      async (updatedAccountInfo: any) => {
        const pdaPubkey = updatedAccountInfo.accountId.toBase58();
        console.log(`📡 Detected on-chain Solana Escrow Account Change: ${pdaPubkey}`);

        // Match escrow PDA to project in database
        const project = await Project.findOne({ escrowPda: pdaPubkey });
        if (project && project.status === "open") {
          console.log(`⚡ Updating project ${project.projectId} status on-chain sync`);
        }
      },
      "confirmed",
    );
  } catch (error) {
    console.error("Error starting Solana Watcher:", error);
  }
};
