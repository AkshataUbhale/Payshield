/**
 * API Service — PayShield
 * Handles communication with the PayShield backend (Node.js/Express REST API).
 *
 * Base URL configured via: VITE_API_BASE_URL=http://localhost:5000/api
 */

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/** Generic request helper */
const request = async (method, path, body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginEmail     = (email, password)  => request("POST", "/auth/login",  { email, password });
export const registerEmail  = (email, password)  => request("POST", "/auth/register", { email, password });
export const loginWallet    = (address, signature) => request("POST", "/auth/wallet", { address, signature });

// ── Contracts ─────────────────────────────────────────────────────────────
export const getContracts   = (token)        => request("GET",  "/contracts",      null, token);
export const getContract    = (id, token)    => request("GET",  `/contracts/${id}`, null, token);
export const createContract = (data, token)  => request("POST", "/contracts",      data, token);
export const updateContract = (id, data, token) => request("PUT", `/contracts/${id}`, data, token);

// ── Submissions ───────────────────────────────────────────────────────────
export const submitWork  = (contractId, ipfsHash, note, token) =>
  request("POST", "/submissions", { contractId, ipfsHash, note }, token);
export const getSubmissions = (contractId, token) =>
  request("GET", `/submissions/${contractId}`, null, token);

// ── Payments ──────────────────────────────────────────────────────────────
export const approvePayment = (contractId, txHash, token) =>
  request("POST", "/payments/approve", { contractId, txHash }, token);
export const rejectPayment  = (contractId, reason, token)  =>
  request("POST", "/payments/reject", { contractId, reason }, token);

// ── Disputes ──────────────────────────────────────────────────────────────
export const raiseDispute   = (data, token)  => request("POST", "/disputes",      data, token);
export const getDisputes    = (token)        => request("GET",  "/disputes",      null, token);
export const addDisputeMsg  = (id, msg, token) => request("POST", `/disputes/${id}/messages`, { message: msg }, token);
