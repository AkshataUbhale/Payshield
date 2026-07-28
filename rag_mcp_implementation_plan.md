# Detailed Implementation Plan: RAG, MCP, & ML Integration for PayShield

This document outlines the detailed system architecture, exact AI/ML models (Hugging Face & NVIDIA NIMs), code implementation steps, and security strategies to integrate **Retrieval-Augmented Generation (RAG)**, the **Model Context Protocol (MCP)**, and **Predictive Machine Learning** into PayShield.

---

## 1. System Architecture

The AI-Native Decentralized Work Platform integrates three separate components into a single, cohesive workflow:
1. **Predictive ML:** Evaluates reputation risk and fraud patterns based on numerical transaction records.
2. **Semantic RAG:** Audits documents, matches freelancer skills to requirements, and retrieves arbitration precedents.
3. **MCP Agents:** Grants the LLM action-oriented tools to read GitHub repositories, verify milestone progress, and query the Solana blockchain state.

```text
                               ┌─────────────────┐
                               │ React Frontend  │
                               └────────┬────────┘
                                        │ (JWT / HTTPS)
                                        ▼
                               ┌─────────────────┐
                               │  Backend API    │
                               └────────┬────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
  ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │  ML Reputation  │          │  RAG Engine     │          │   MCP Server    │
  │     Engine      │          │ (Vector Store)  │          │ (Tool Protocol) │
  └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
           │ (Scikit-Learn)             │ (Embeddings)               │ (RPC Calls)
           ▼                            ▼                            ▼
  ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │ Random Forest   │          │ Qdrant Vector   │          │ - GitHub Tool   │
  │ Predictor       │          │ Database        │          │ - Solana RPC    │
  └─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

## 2. AI & ML Model Recommendations

To maintain technical maturity, we recommend using pre-trained, open-weights models available on **Hugging Face** (for cost-efficiency and local deployment) or **NVIDIA NIM** (for high-speed, enterprise-grade inference).

### A. RAG Embedding Model (Text Vectorization)
Responsible for converting contract clauses, dispute summaries, and user profiles into 384 or 1024-dimensional semantic vectors.
* **Hugging Face Recommendation:** `BAAI/bge-small-en-v1.5`
  * *Why:* Extremely lightweight (only 133M parameters), top-tier retrieval performance on the MTEB leaderboard, runs easily in a Node.js/Python microservice with minimal CPU usage.
* **NVIDIA NIM Recommendation:** `nvidia/embeddings-nv-embed-qa-4`
  * *Why:* Optimized specifically for question-answering retrieval tasks with superior zero-shot performance on complex legal or financial texts.

### B. LLM Reasoning Agent (Chat, Audit & Tool-Calling)
Responsible for analyzing retrieved documents, auditing contract drafts, and calling MCP tools.
* **Hugging Face Recommendation:** `Qwen/Qwen2.5-7B-Instruct` or `meta-llama/Llama-3-8B-Instruct`
  * *Why:* SOTA performance in the 7B-8B parameter range, natively supports JSON output formats, and has built-in tool-calling capability (essential for MCP).
* **NVIDIA NIM Recommendation:** `meta/llama3-70b-instruct` or `mistralai/mixtral-8x22b-instruct`
  * *Why:* Ideal for fast API calls. NIMs provide low-latency token generation, enabling real-time chatbot replies and complex reasoning across thousands of tokens.

### C. Reputation & Trust Predictive Model (ML)
Responsible for calculating numeric trust scores based on contract delivery data.
* **Algorithm Recommendation:** **Random Forest Classifier / Regressor** (via `scikit-learn` or `xgboost` in Python).
* **Input Features:**
  1. `DisputesCount`: Number of disputes raised.
  2. `LateDeliveriesRatio`: Percentage of deliverables submitted past the deadline.
  3. `RatingAverage`: Mean star rating from previous clients.
  4. `WalletAgeSeconds`: Lifespan of the wallet since its first transaction.
  5. `ActiveEscrowsCount`: Currently active contracts.
* *Why:* Random Forest is explainable. We can extract **Feature Importances** (e.g., *"Late submissions contributed 45% to your trust score decrease"*), which the RAG engine combines with LLMs to generate readable trust score reports.

---

## 3. Trust & Transparency Strategy (How to make it trust-worthy)

AI applications often suffer from a lack of auditability. To make PayShield's AI systems fully transparent, we recommend implementing the following three pillars:

> [!TIP]
> **Pillar 1: Cryptographically Signed AI Recommendations**
> Create an off-chain Authority Keypair for the AI Agent. When the AI generates a dispute split recommendation or a contract audit, it base64-signs the result string:
> `nacl.sign.detached(auditJSON, AI_authority_private_key)`
> The signature is returned with the payload. Any user can verify the signature using the AI’s public key to prove the platform administrator did not manually alter the audit or dispute verdict.

> [!IMPORTANT]
> **Pillar 2: On-Chain Audit Logging (Solana Event Logs)**
> When a contract is deployed or a dispute is resolved, commit the SHA-256 hash of the final RAG/ML recommendation payload on-chain. This creates an immutable link on the Solana blockchain, proving that the executed smart contract action aligns with the AI's audited decision.

> [!NOTE]
> **Pillar 3: Open-Source Deterministic Prompts**
> Publish prompt templates, system instructions, and RAG schemas openly on GitHub. By making the prompts public, users can verify that the LLM is not biased toward the platform, clients, or specific freelancers.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Establish the Vector Database & RAG Pipeline
1. **Setup Vector Database:** Deploy Qdrant (open-source) locally or via Docker.
2. **Create Collections:**
   * `platform_docs`: Index FAQs, refund policies, and escrow rules.
   * `dispute_precedents`: Index past disputes, their summaries, and final splits (anonymized).
3. **Ingest Documents:** Write a script in your backend to compute embeddings using `bge-small-en-v1.5` and upload them to Qdrant.
4. **Build RAG Query Route:** Create `POST /api/ai/rag/query`. The route:
   * Vectorizes the user's question.
   * Searches Qdrant for the top 3 similar documents.
   * Appends documents to the LLM system prompt.
   * Feeds the prompt to the LLM (e.g. Qwen2.5/Llama-3) and returns the answer.

### Phase 2: Deploy the MCP Server (Tool-Calling)
1. **Initialize MCP Server:** Build a sub-service using the `@modelcontextprotocol/sdk` (Node.js).
2. **Define GitHub Tools:**
   * `get_repository_commits(owner, repo)`: Queries the GitHub API to fetch commit history.
   * `get_pull_request_diff(owner, repo, prNumber)`: Evaluates code modifications.
3. **Define Blockchain (Solana) Tools:**
   * `get_escrow_state(projectId)`: Uses `@solana/web3.js` to read the on-chain PDA account state.
   * `get_wallet_balance(wallet)`: Reads USDC/SOL balances directly from the ledger.
4. **Integrate Server with LLM Agent:** Configure the LLM reasoning endpoint to use the MCP tools schema. If the LLM generates a tool call, the backend executes the tool and returns the data back to the LLM context.

### Phase 3: Build the "AI Project Health Agent" (ML + RAG + MCP)
Every night, a background worker runs:
1. **Gather Data via MCP:** Reads GitHub commits, Solana transaction records, and contract deadline status.
2. **Predict via ML Model:** Feeds data into the trained Random Forest model. If the model predicts a high probability of failure (e.g., zero commits 3 days before deadline), flag the contract.
3. **Summarize via RAG:** The LLM queries platform policies for delayed work and summarizes a warning notice for the client and freelancer.
4. **Notification:** Sends alerts to both users recommending a renegotiation (linking back to the Negotiation Hub).
