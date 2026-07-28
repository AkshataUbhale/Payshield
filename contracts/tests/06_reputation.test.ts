import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanahubProtocol } from "../target/types/solanahub_protocol";
import { expect } from "chai";
import { createProject, assignFreelancer } from "./test-helpers";

describe("Reputation System", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .SolanahubProtocol as Program<SolanahubProtocol>;

  let client: anchor.web3.Keypair;
  let freelancer: anchor.web3.Keypair;
  let projectId: number;

  beforeEach(async () => {
    client = anchor.web3.Keypair.generate();
    freelancer = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      client.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.requestAirdrop(
      freelancer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    projectId = await createProject(program, client, {
      title: "Reputation Project",
      totalBudget: 1000000,
      milestoneCount: 1,
    });
    await assignFreelancer(program, client, projectId, freelancer.publicKey);
  });

  it("Client can review freelancer", async () => {
    const rating = 5;
    const commentHash = new Uint8Array(32).fill(1);

    const [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("project"),
        new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const [reputationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reputation"), freelancer.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .submitReview(new anchor.BN(projectId), rating, Array.from(commentHash))
      .accounts({
        project: projectPDA,
        reviewer: client.publicKey,
        targetUser: freelancer.publicKey,
        reputation: reputationPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([client])
      .rpc();

    const reputation = await program.account.reputation.fetch(reputationPDA);
    expect(reputation.totalReviews.toNumber()).to.equal(1);
    expect(reputation.averageRating).to.equal(50); // 5.0 * 10
    expect(reputation.user.toString()).to.equal(
      freelancer.publicKey.toString(),
    );
  });
});
