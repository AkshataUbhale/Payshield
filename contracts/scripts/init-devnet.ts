import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanahubProtocol } from "../target/types/solanahub_protocol";
import fs from "fs";
import os from "os";

async function main() {
  // Setup Provider
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );

  const walletPath = os.homedir() + "/.config/solana/id.json";
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8"))),
  );
  const wallet = new anchor.Wallet(walletKeypair);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  anchor.setProvider(provider);

  const program = anchor.workspace
    .SolanahubProtocol as Program<SolanahubProtocol>;

  // NOTE: If workspace is not loaded (running via ts-node outside anchor test), we need to load program manually.
  // But anchor.workspace relies on ANCHOR environment.
  // Better to load program explicitly with IDL.

  const idl = JSON.parse(
    fs.readFileSync("./target/idl/solanahub_protocol.json", "utf8"),
  );
  const programId = new anchor.web3.PublicKey(
    "H4R1nUBp4Gfuw9uPZwfrKyTVgP3TrQ2RzMD1puWjqYsY",
  );
  const programManual = new anchor.Program(idl, provider);

  console.log("Initializing Global State...");

  const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    programManual.programId,
  );

  try {
    // Try passing minimal accounts first. Anchor 0.30 often resolves them.
    // If globalState is PDA init, it might need to be passed if seeds are static?
    // Let's try explicit first based on previous error that claimed it was MISSING in type?
    // Wait, the previous error said 'globalState' DOES NOT EXIST in type ResolvedAccounts.
    // This usually means Anchor inferred it and removed it from the input type.
    const tx = await programManual.methods
      .initialize()
      .accounts({
        admin: wallet.publicKey,
      })
      .rpc();

    console.log("Global State Initialized! Tx:", tx);
  } catch (error) {
    console.error("Error initializing:", error);
  }
}

main();
