import { createContext, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getNonce, loginWalletWithSignature } from "../services/api";
import bs58 from "bs58";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const { publicKey, signMessage } = useWallet();

  useEffect(() => {
    const stored = sessionStorage.getItem("ps_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const loginWithWallet = async (address, role = "freelancer") => {
    if (!publicKey || !signMessage) {
      throw new Error("Solana wallet is not fully connected or doesn't support message signing.");
    }
    try {
      // 1. Fetch challenge nonce from backend
      const { nonce } = await getNonce(address);

      // 2. Request wallet signature
      const messageBytes = new TextEncoder().encode(nonce);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // 3. Login with signature
      const res = await loginWalletWithSignature(address, signature);
      const userData = {
        id: res.user.publicKey,
        name: res.user.fullName || (res.user.username ? res.user.username : `${res.user.publicKey.slice(0, 6)}...${res.user.publicKey.slice(-4)}`),
        fullName: res.user.fullName || null,
        email: res.user.email || null,
        role: res.user.role || role,
        walletAddress: res.user.publicKey,
        avatar: res.user.avatarUrl || null,
        onboardingComplete: !!res.user.onboardingComplete,
        joinedAt: new Date(res.user.createdAt).toISOString().split("T")[0],
      };

      sessionStorage.setItem("ps_token", res.token);
      sessionStorage.setItem("ps_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Wallet login failed:", err);
      throw err;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("ps_user");
    sessionStorage.removeItem("ps_token");
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    sessionStorage.setItem("ps_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithWallet, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
