import { useContext } from "react";
import { WalletContext } from "../context/WalletContext";

export const WalletStatus = () => {
    const { publicKey, connected, shortAddress } = useContext(WalletContext);

    return connected ? (
        <p className="text-green-600 font-medium">Connected: {shortAddress}</p>
    ) : (
        <p className="text-red-600 font-medium">Wallet not connected</p>
    );
};
