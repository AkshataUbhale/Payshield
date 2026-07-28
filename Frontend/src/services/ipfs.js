/**
 * IPFS Service — PayShield
 * Uses the Pinata REST API to pin files and JSON metadata to IPFS.
 *
 * Set your Pinata JWT in an .env file:
 *   VITE_PINATA_JWT=your_pinata_api_jwt
 */

const PINATA_API = "https://api.pinata.cloud/pinning";
const JWT = import.meta.env.VITE_PINATA_JWT || "";

const headers = () => ({
  Authorization: `Bearer ${JWT}`,
});

/**
 * Upload a single file to IPFS via Pinata.
 * @param {File} file
 * @param {string} contractId
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export const uploadFile = async (file, contractId = "") => {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: { contractId, uploadedAt: new Date().toISOString() },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  const res = await fetch(`${PINATA_API}/pinFileToIPFS`, {
    method: "POST",
    headers: headers(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.details || "IPFS upload failed");
  }

  const data = await res.json();
  return {
    ipfsHash: data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
};

/**
 * Upload multiple files to IPFS.
 * @param {File[]} files
 * @param {string} contractId
 * @returns {Promise<Array>}
 */
export const uploadFiles = async (files, contractId = "") => {
  return Promise.all(files.map((f) => uploadFile(f, contractId)));
};

/**
 * Pin JSON metadata to IPFS (e.g. contract details, submission record).
 * @param {object} json
 * @param {string} name
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export const pinJson = async (json, name = "payshield-record") => {
  const res = await fetch(`${PINATA_API}/pinJSONToIPFS`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name },
    }),
  });

  if (!res.ok) throw new Error("JSON pinning failed");
  const data = await res.json();
  return {
    ipfsHash: data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
};

/**
 * Resolve an IPFS hash to a public gateway URL.
 * @param {string} hash CID hash
 * @returns {string}
 */
export const resolveIPFS = (hash) =>
  `https://gateway.pinata.cloud/ipfs/${hash}`;

/**
 * Simulate/mock file upload for demo purposes (no API key needed).
 * Returns a fake CID instantly.
 * @param {File[]} files
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export const mockUpload = async (files) => {
  await new Promise((r) => setTimeout(r, 2000));
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomHash = "Qm" + Array.from({ length: 44 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return {
    ipfsHash: randomHash,
    url: `https://ipfs.io/ipfs/${randomHash}`,
  };
};
