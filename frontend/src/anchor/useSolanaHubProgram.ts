import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { SolanahubProtocol } from "./solanahub_protocol";
import solanahubJson from "./solanahub_protocol.json";

const PROGRAM_ID = new PublicKey(
  "H4R1nUBp4Gfuw9uPZwfrKyTVgP3TrQ2RzMD1puWjqYsY",
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
