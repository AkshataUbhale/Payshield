import { ethers } from "ethers";

/**
 * Connect to MetaMask and return the signer.
 * @returns {Promise<ethers.Signer>}
 */
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please add the MetaMask browser extension.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return signer;
};

/**
 * Get the connected wallet address.
 * @returns {Promise<string>}
 */
export const getWalletAddress = async () => {
  const signer = await connectWallet();
  return signer.getAddress();
};

/**
 * Get ETH balance for an address.
 * @param {string} address
 * @returns {Promise<string>} formatted balance in ETH
 */
export const getBalance = async (address) => {
  if (!window.ethereum) return "0";
  const provider = new ethers.BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

/**
 * Get an Escrow contract instance.
 * @param {string} contractAddress deployed contract address
 * @param {string[]} abi contract ABI
 * @returns {Promise<ethers.Contract>}
 */
export const getEscrowContract = async (contractAddress, abi) => {
  const signer = await connectWallet();
  return new ethers.Contract(contractAddress, abi, signer);
};

/**
 * Deploy a new Escrow contract.
 * @param {string} freelancerAddress
 * @param {string} amountEth amount in ETH
 * @param {string[]} abi
 * @param {string} bytecode
 * @returns {Promise<ethers.ContractDeployTransaction>}
 */
export const deployEscrow = async (freelancerAddress, amountEth, abi, bytecode) => {
  const signer = await connectWallet();
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(freelancerAddress, {
    value: ethers.parseEther(amountEth),
  });
  await contract.waitForDeployment();
  return contract;
};

/**
 * Listen for MetaMask account changes.
 * @param {Function} callback
 */
export const onAccountChange = (callback) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", callback);
  }
};

/**
 * Listen for network changes.
 * @param {Function} callback
 */
export const onNetworkChange = (callback) => {
  if (window.ethereum) {
    window.ethereum.on("chainChanged", callback);
  }
};
