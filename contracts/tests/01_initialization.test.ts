import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanahubProtocol } from "../target/types/solanahub_protocol";
import { expect } from "chai";

describe("Protocol Initialization", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .SolanahubProtocol as Program<SolanahubProtocol>;

  it("Is initialized correctly", async () => {
    // Add logic to check if global state exists or initialize it
    const [globalStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId,
    );

    try {
      const globalState = await program.account.globalState.fetch(
        globalStatePDA,
      );
      expect(globalState).to.not.be.null; // Already initialized
    } catch (e) {
      // Initialize if not found
      const admin = anchor.web3.Keypair.generate();
      await provider.connection.requestAirdrop(
        admin.publicKey,
        10 * anchor.web3.LAMPORTS_PER_SOL,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await program.methods
        .initialize()
        .accounts({
          globalState: globalStatePDA,
          admin: admin.publicKey,
        } as any)
        .signers([admin])
        .rpc();

      const globalState = await program.account.globalState.fetch(
        globalStatePDA,
      );
      expect(globalState.totalProjects.toNumber()).to.equal(0);
      expect(globalState.totalDisputes.toNumber()).to.equal(0);
      expect(globalState.admin.toString()).to.equal(admin.publicKey.toString());
    }
  });
});
