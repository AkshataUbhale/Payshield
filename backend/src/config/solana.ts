import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { join } from "path";

export const PROGRAM_ID = new PublicKey(
  process.env.SOLANA_PROGRAM_ID || "43QYPVLRMQ9skLbbbZ3uGPsLtTbxcmuU4S5hoZ8bXJKS"
);

export async function initializeSolana() {
  // HTTP connection (for RPC calls)
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    },
  );

  console.log("✅ Connected to Solana RPC");

  // Load IDL
  // Note: Adjusting path to match typical monorepo structure if needed.
  // Assuming solanahub_protocol is available relative to src.
  // If we are in /home/raushan/solanahub/src/config/solana.ts, then ../../../solanahub_protocol might be the path?
  // User prompt said: join(__dirname, '../../solanahub_protocol/target/idl/solanahub_protocol.json')
  // Root is /home/raushan/solanahub.
  // src is /home/raushan/solanahub/src.
  // config is /home/raushan/solanahub/src/config.
  // so ../../solanahub_protocol is correct if we assume execution from dist, but for TS file logic relative to source:
  // src/config -> src -> solanahub

  // Let's try to locate the IDL first to be safe, but for now I will write the code as requested and verify path.
  // Actually, I'll use a dynamic path search or just stick to what the user provided, but I suspect the path might need slight adjustment if running from ts-node or dist.
  // I'll stick to the user's suggestion for now but verify file existence.

  let idlStr = "";
  const pathsToTry = [
    // Monorepo new paths (running from backend or root)
    join(process.cwd(), "../contracts/target/idl/solanahub_protocol.json"),
    join(process.cwd(), "contracts/target/idl/solanahub_protocol.json"),
    // Fallback original paths
    join(process.cwd(), "../solanahub_protocol/target/idl/solanahub_protocol.json"),
    join(process.cwd(), "solanahub_protocol/target/idl/solanahub_protocol.json"),
  ];

  let loaded = false;
  for (const idlPath of pathsToTry) {
    try {
      idlStr = readFileSync(idlPath, "utf-8");
      console.log(`✅ Loaded IDL from: ${idlPath}`);
      loaded = true;
      break;
    } catch (e) {
      // Continue trying next path
    }
  }

  if (!loaded) {
    console.warn(
      "Failed to load IDL. Solana program interaction will not work."
    );
    // Return partial connection if IDL fails, so server doesn't crash
    return { connection, program: null, programId: null };
  }

  const idl = JSON.parse(idlStr);
  const programId = new PublicKey(process.env.SOLANA_PROGRAM_ID!);

  // Create a dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };

  const provider = new AnchorProvider(connection, dummyWallet as Wallet, {
    commitment: "confirmed",
  });

  // Inject program ID into IDL if needed, as newer Anchor versions expect address in IDL or 2nd arg as Provider
  idl.address = programId.toString();

  const program = new Program(idl, provider);

  console.log("Program loaded:", programId.toString());

  return { connection, program, programId };
}
