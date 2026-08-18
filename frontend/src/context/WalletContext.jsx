/* WalletContext.jsx – real Solana integration (Devnet) */
import { createContext, useContext, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

// ── Context ──────────────────────────────────────────────────────────────────
export const WalletContext = createContext({
  publicKey: null,
  connected: false,
  signTransaction: null,
  signAllTransactions: null,
  sendTransaction: null,
  shortAddress: null,
  shortAddr: null,   // alias so old code keeps working
});

// ── Inner bridge: reads Solana adapter state → our context ───────────────────
function WalletBridge({ children }) {
  const {
    publicKey,
    connected,
    signTransaction,
    signAllTransactions,
    sendTransaction,
  } = useSolanaWallet();

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`
    : null;

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected,
        signTransaction,
        signAllTransactions,
        sendTransaction,
        shortAddress,
        shortAddr: shortAddress, // alias for backward compat
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ── Public provider – wrap the whole app with this ───────────────────────────
export function CustomWalletProvider({ children }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletBridge>
            {children}
          </WalletBridge>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useWalletCtx() {
  return useContext(WalletContext); // never throws – returns safe defaults
}
