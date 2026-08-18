import { createContext, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getNonce, loginWalletWithSignature } from "../services/api";
import bs58 from "bs58";

export const AuthContext = createContext(null);

const DEMO_USERS = {
  "freelancer@demo.com": {
    id: "f1", name: "Alex Johnson", email: "freelancer@demo.com",
    role: "freelancer", walletAddress: "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12",
    avatar: null, joinedAt: "2024-01-15"
  },
  "client@demo.com": {
    id: "c1", name: "Sarah Chen", email: "client@demo.com",
    role: "client", walletAddress: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234",
    avatar: null, companyName: "TechStartup Inc.", joinedAt: "2024-02-10"
  },
};

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

  const login = (email, password, role) => {
    // Demo login: accept any password, use role param if not pre-set
    const preset = DEMO_USERS[email];
    const userData = preset ?? {
      id: `u_${Date.now()}`,
      name: email.split("@")[0].replace(/\./g," "),
      email,
      role: role || "freelancer",
      walletAddress: null,
      avatar: null,
      joinedAt: new Date().toISOString().split("T")[0],
    };
    sessionStorage.setItem("ps_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

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
        name: `${res.user.publicKey.slice(0, 6)}...${res.user.publicKey.slice(-4)}`,
        email: res.user.email || null,
        role: res.user.role || role,
        walletAddress: res.user.publicKey,
        avatar: res.user.avatarUrl || null,
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

  const signup = (name, email, password, role) => {
    const userData = {
      id: `u_${Date.now()}`,
      name,
      email,
      role,
      walletAddress: null,
      avatar: null,
      joinedAt: new Date().toISOString().split("T")[0],
    };
    sessionStorage.setItem("ps_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem("ps_user");
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    sessionStorage.setItem("ps_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithWallet, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
