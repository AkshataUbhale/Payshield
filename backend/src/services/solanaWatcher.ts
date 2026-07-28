import { Connection, PublicKey } from "@solana/web3.js";
import Project from "../models/Project.js";

const PROGRAM_ID = new PublicKey(
  "H4R1nUBp4Gfuw9uPZwfrKyTVgP3TrQ2RzMD1puWjqYsY",
);

export const startSolanaWatcher = () => {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  console.log(`Starting Solana Watcher on ${rpcUrl}...`);
  console.log(`Watching Program ID: ${PROGRAM_ID.toBase58()}`);

  if (PROGRAM_ID.toBase58() === "11111111111111111111111111111111") {
    console.log("Watcher skipped: Default placeholder Program ID detected.");
    return;
  }

  // In a real Anchor app, we would use the program's event parser.
  // For this scaffold, we'll demonstrate a polling mechanism or account subscription.
  // Since we don't have the IDL, subscription to 'programId' changes is generic.

  // Real implementation strategy:
  // 1. Subscribe to 'onProgramAccountChange'
  // 2. Decode account data
  // 3. Match 'projectId' in data to MongoDB 'projectId'
  // 4. Update status

  // For demonstration/scaffold:
  try {
    connection.onProgramAccountChange(
      PROGRAM_ID,
      async (updatedAccountInfo: any, context: any) => {
        console.log(
          "Detected Program Account Change:",
          updatedAccountInfo.accountId.toBase58(),
        );

        // Mock: Assume we can extract projectId from the account data
        // const decodedData = decode(updatedAccountInfo.accountInfo.data);
        // const onChainProjectId = decodedData.projectId;

        // Mock Update Logic
        // await Project.findOneAndUpdate(
        //   { projectId: onChainProjectId, status: 'pending' },
        //   { status: 'open' }
        // );
      },
      "confirmed",
    );
  } catch (error) {
    console.error("Error starting Solana Watcher:", error);
  }
};
