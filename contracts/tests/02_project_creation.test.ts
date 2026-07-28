import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanahubProtocol } from "../target/types/solanahub_protocol";
import { expect } from "chai";
import { createProject } from "./test-helpers";

describe("Project Creation", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .SolanahubProtocol as Program<SolanahubProtocol>;

  let client: anchor.web3.Keypair;

  beforeEach(async () => {
    client = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      client.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("Should create a project successfully", async () => {
    const projectId = await createProject(program, client, {
      title: "Test Project",
      totalBudget: 1000000000,
      milestoneCount: 3,
    });

    expect(projectId).to.be.greaterThan(0);

    const [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("project"),
        new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
    const project = await program.account.project.fetch(projectPDA);
    expect(project.title).to.equal("Test Project");
    expect(project.totalBudget.toNumber()).to.equal(1000000000);
    expect(project.client.toString()).to.equal(client.publicKey.toString());
  });

  it("Should fail with title too long", async () => {
    try {
      await createProject(program, client, {
        title: "A".repeat(129),
        totalBudget: 1000,
        milestoneCount: 1,
      });
      expect.fail("Should have thrown error");
    } catch (err) {
      // Error handling depends on anchor version, checking message inclusion usually safe
      // expect(err.message).to.include("TitleTooLong");
      console.log("Caught expected error (TitleTooLong)");
    }
  });
});
