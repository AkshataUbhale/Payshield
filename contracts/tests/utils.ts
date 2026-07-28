import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanahubProtocol } from "../target/types/solanahub_protocol";

export const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
export const program = anchor.workspace
  .SolanahubProtocol as Program<SolanahubProtocol>;

export const confirmTx = async (tx: string) => {
  await provider.connection.confirmTransaction(tx);
};

export const getBalance = async (pubkey: anchor.web3.PublicKey) => {
  return await provider.connection.getBalance(pubkey);
};

export const airdrop = async (
  pubkey: anchor.web3.PublicKey,
  amount: number,
) => {
  const signature = await provider.connection.requestAirdrop(
    pubkey,
    amount * anchor.web3.LAMPORTS_PER_SOL,
  );
  await confirmTx(signature);
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
