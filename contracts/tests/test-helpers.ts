import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanahubProtocol } from "../target/types/solanahub_protocol";

export const createProject = async (
  program: Program<SolanahubProtocol>,
  client: anchor.web3.Keypair,
  args: {
    title: string;
    totalBudget: number;
    milestoneCount: number;
  },
) => {
  const globalStatePDA = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId,
  )[0];

  const globalState = await program.account.globalState
    .fetch(globalStatePDA)
    .catch(() => null);
  const nextProjectId = globalState
    ? globalState.totalProjects.toNumber() + 1
    : 1;

  const projectPDA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("project"),
      new anchor.BN(nextProjectId).toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  )[0];

  const descriptionHash = new Uint8Array(32).fill(1); // Dummy hash
  const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // 1 day future

  await program.methods
    .createProject(
      args.title,
      Array.from(descriptionHash),
      new anchor.BN(args.totalBudget),
      args.milestoneCount,
      deadline,
      0, // category
    )
    .accounts({
      globalState: globalStatePDA,
      project: projectPDA,
      client: client.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    } as any)
    .signers([client])
    .rpc();

  return nextProjectId;
};

export const assignFreelancer = async (
  program: Program<SolanahubProtocol>,
  client: anchor.web3.Keypair,
  projectId: number,
  freelancer: anchor.web3.PublicKey,
) => {
  const [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("project"),
      new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  await program.methods
    .assignFreelancer(freelancer)
    .accounts({
      project: projectPDA,
      caller: client.publicKey,
    } as any)
    .signers([client])
    .rpc();
};

export const initializeEscrow = async (
  program: Program<SolanahubProtocol>,
  client: anchor.web3.Keypair,
  projectId: number,
  milestoneAmounts: number[],
  mint: anchor.web3.PublicKey,
  clientAta: anchor.web3.PublicKey,
  escrowVault: anchor.web3.PublicKey,
) => {
  const [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("project"),
      new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  const [escrowPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  const amountsBN = milestoneAmounts.map((a) => new anchor.BN(a));

  // SPL Token Program IDs
  const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  );
  const ASSOCIATED_TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  );

  await program.methods
    .initializeEscrow(new anchor.BN(projectId), amountsBN)
    .accounts({
      project: projectPDA,
      escrow: escrowPDA,
      client: client.publicKey,
      mint: mint,
      clientAta: clientAta,
      escrowVault: escrowVault,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    } as any)
    .signers([client])
    .rpc();
};

export const createMilestone = async (
  program: Program<SolanahubProtocol>,
  client: anchor.web3.Keypair,
  projectId: number,
  milestoneIndex: number,
  amount: number,
) => {
  const [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("project"),
      new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  const [milestonePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("milestone"),
      new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
      new Uint8Array([milestoneIndex]),
    ],
    program.programId,
  );

  const descriptionHash = new Uint8Array(32).fill(2); // Dummy hash

  await program.methods
    .createMilestone(
      milestoneIndex,
      Array.from(descriptionHash),
      new anchor.BN(amount),
    )
    .accounts({
      project: projectPDA,
      milestone: milestonePDA,
      client: client.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    } as any)
    .signers([client])
    .rpc();
};
