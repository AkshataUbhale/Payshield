import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanahubProtocol } from "../target/types/solanahub_protocol";
import { expect } from "chai";
import {
  createProject,
  assignFreelancer,
  initializeEscrow,
} from "./test-helpers";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

describe("USDC Escrow Management", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .SolanahubProtocol as Program<SolanahubProtocol>;

  let client: anchor.web3.Keypair;
  let freelancer: anchor.web3.Keypair;
  let mintAuthority: anchor.web3.Keypair;
  let mint: anchor.web3.PublicKey;
  let projectId: number;

  before(async () => {
    // 1. Setup Accounts
    client = anchor.web3.Keypair.generate();
    freelancer = anchor.web3.Keypair.generate();
    mintAuthority = anchor.web3.Keypair.generate();

    // Airdrop SOL
    await provider.connection.requestAirdrop(
      client.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.requestAirdrop(
      freelancer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.requestAirdrop(
      mintAuthority.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );

    // Wait for airdrop confirmation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Create USDC Mint
    mint = await createMint(
      provider.connection,
      mintAuthority,
      mintAuthority.publicKey,
      null,
      6, // 6 decimals like USDC
    );
  });

  it("Should create project and initialize escrow with USDC", async () => {
    // 1. Create Project
    projectId = await createProject(program, client, {
      title: "USDC Project",
      totalBudget: 1000 * 1000000, // 1000 USDC (6 decimals)
      milestoneCount: 2,
    });

    await assignFreelancer(program, client, projectId, freelancer.publicKey);

    // 2. Setup Client Token Account
    const clientAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      client,
      mint,
      client.publicKey,
    );

    // 3. Mint USDC to Client
    await mintTo(
      provider.connection,
      mintAuthority,
      mint,
      clientAta.address,
      mintAuthority,
      2000 * 1000000, // 2000 USDC
    );

    // 4. Initialize Escrow
    const [escrowPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const escrowVault = await getAssociatedTokenAddress(mint, escrowPDA, true);

    await initializeEscrow(
      program,
      client,
      projectId,
      [500 * 1000000, 500 * 1000000], // 500 + 500 = 1000 USDC
      mint,
      clientAta.address,
      escrowVault,
    );

    // 5. Verify Escrow State
    const escrowAccount = await program.account.escrow.fetch(escrowPDA);
    expect(escrowAccount.totalAmount.toNumber()).to.equal(1000 * 1000000);
    expect(escrowAccount.mint.toBase58()).to.equal(mint.toBase58());

    // 6. Verify Vault Balance
    const vaultBalance = await provider.connection.getTokenAccountBalance(
      escrowVault,
    );
    expect(vaultBalance.value.amount).to.equal((1000 * 1000000).toString());

    console.log("Escrow initialized with USDC successfully!");
  });
});
