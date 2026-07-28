import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// CRITICAL: Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletContext = createContext(null);

function WalletInnerProvider({ children }) {
  const { publicKey, wallet, disconnect: solanaDisconnect, connected, connecting, signMessage } = useSolanaWallet();
  const { setVisible } = useWalletModal();
  const [balance, setBalance] = useState("0.00");
  
  const endpoint = "https://api.devnet.solana.com";
  
  // Fetch balance when public key changes
  useEffect(() => {
    if (!publicKey) {
      setBalance("0.00");
      return;
    }
    
    const fetchBalance = async () => {
      try {
        const connection = new Connection(endpoint, "confirmed");
        const bal = await connection.getBalance(publicKey);
        setBalance((bal / LAMPORTS_PER_SOL).toFixed(2));
      } catch (err) {
        console.error("Error fetching Solana balance:", err);
        setBalance("0.00");
      }
    };
    
    fetchBalance();
    // Fetch balance periodically
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const connect = useCallback(() => {
    try {
      setVisible(true);
    } catch (err) {
      console.error("Wallet modal trigger failed:", err);
    }
  }, [setVisible]);

  const disconnect = useCallback(async () => {
    try {
      await solanaDisconnect();
      sessionStorage.removeItem("ps_user");
    } catch (err) {
      console.error("Wallet disconnect failed:", err);
    }
  }, [solanaDisconnect]);

  const address = useMemo(() => publicKey ? publicKey.toBase58() : null, [publicKey]);
  const shortAddr = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <WalletContext.Provider value={{
      address,
      balance,
      network: "Solana Devnet",
      connected,
      connecting,
      shortAddr,
      connect,
      disconnect,
      wallet,
      signMessage
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = "https://api.devnet.solana.com";

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <WalletInnerProvider>
            {children}
          </WalletInnerProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
