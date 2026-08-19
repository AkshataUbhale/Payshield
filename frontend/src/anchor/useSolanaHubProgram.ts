import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { SolanahubProtocol } from "./solanahub_protocol";
import solanahubJson from "./solanahub_protocol.json";

const PROGRAM_ID = new PublicKey(
  "43QYPVLRMQ9skLbbbZ3uGPsLtTbxcmuU4S5hoZ8bXJKS",
);

export const useSolanaHubProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<SolanahubProtocol>(solanahubJson as any, provider);
  }, [provider]);

  return { program, provider };
};
