import { createContext, useState, useEffect, useCallback } from "react";

export const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress]   = useState(null);
  const [balance, setBalance]   = useState("0.00");
  const [network, setNetwork]   = useState("Polygon");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const DEMO_BALANCE = "420.50";

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const addr = accounts[0];
        setAddress(addr);
        setBalance(DEMO_BALANCE);
        setConnected(true);

        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length === 0) disconnect();
          else setAddress(accounts[0]);
        });
      } else {
        // Demo mode — no MetaMask
        const demoAddr = "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12";
        setAddress(demoAddr);
        setBalance(DEMO_BALANCE);
        setConnected(true);
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance("0.00");
    setConnected(false);
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    const stored = sessionStorage.getItem("ps_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.walletAddress) {
        setAddress(user.walletAddress);
        setBalance(DEMO_BALANCE);
        setConnected(true);
      }
    }
  }, []);

  const shortAddr = address ? `${address.slice(0,6)}...${address.slice(-4)}` : null;

  return (
    <WalletContext.Provider value={{
      address, balance, network, connected, connecting,
      shortAddr, connect, disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
}
