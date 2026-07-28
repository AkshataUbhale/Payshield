# PayShield: Official Feature Specification Document

PayShield is a trustless, decentralized freelance marketplace built on the Solana blockchain. It combines off-chain collaborative tools with on-chain financial enforcement to eliminate intermediary fees, automate dispute resolution, and establish transparent contractual relations.

---

## 🔑 1. Cryptographic Authentication & User Management
* **Wallet-Based Challenge-Response Auth:** Passwordless login using Solana wallet keypairs. The server challenges the client with a CSPRNG-generated one-time nonce, verifies the Ed25519 signature, and issues a JWT session token.
* **Nonce Rotation:** Nonces are automatically rotated after every successful authentication attempt to protect against replay attacks.
* **Role-Based Portals:** Tailored user experiences for both **Clients** and **Freelancers**, segregating active workspaces, listings, contract forms, and payment trackers.
* **Profile Customization:** User profile directories storing wallet addresses, biographies, specialized skill tags, hourly rates, and on-chain ratings.

---

## 🤝 2. Collaborative Contract Negotiation Hub
* **Multi-Party Drafting Space:** A mediatory workspace enabling clients and freelancers to collectively draft contract details (Title, Category, Scope description, overall Budget, and Deadline) before committing funds.
* **Dynamic Milestone Allocations:** Allows budgeting projects into sequential milestones with custom descriptions and payment amounts.
* **In-Negotiation Chatroom:** Real-time messaging panel dedicated to each draft negotiation, allowing both parties to align on details within the workspace context.
* **Transparent Change Logging:** A complete, tamper-proof audit log tracking all modifications made during drafting (e.g., *"Sarah Chen updated Milestone 2 budget to 400 USDC"*).
* **Consensus-Driven Approvals:** Edits made by either party automatically reset the signature status of both sides. Escrow deployment is strictly locked until both the client and freelancer sign off on the identical version of the draft.

---

## 🧠 3. Freelance Contract Intelligence Assistant
* **AI-Driven Risk Scoring:** Scans contract drafts to calculate a safety score (0-100) based on scope detail, number of milestones, and clause completeness.
* **Critical Clause Coverage Checklist:** Automatically audits drafts for critical legal provisions:
  * **Intellectual Property (IP) Transfer:** Ensures ownership rights transfer to the client upon milestone payment release.
  * **Confidentiality / NDA:** Detects terms safeguarding sensitive data and proprietary codebases.
  * **Cancellation & Refund Policy:** Validates exit procedures to avoid deadlocks.
  * **Scope Specificity:** Flags short description scopes or single-milestone allocations that increase scope-creep risk.
* **Interactive Clause Q&A Agent:** An integrated chat assistant responding to questions (e.g., *"Who owns the code?", "What if there is a delay?"*) using contextual analysis of the draft terms, suggesting specific recommendations.

---

## 🔐 4. On-Chain Solana Escrow Protocol
* **Program-Derived Address (PDA) Escrow:** Lock budgets securely in smart contract vaults on-chain. Escrows are represented by keyless PDAs (`["escrow", project_id]`) controlled solely by the program logic.
* **Milestone Fund Partitioning:** Escrows enforce milestone partitions. The sum of all milestone releases is validated on-chain to match the total deposited budget.
* **Multi-Currency Support:** Smart contracts support SPL-token locking (e.g., USDC, USDT) and native SOL.
* **Anchor Framework Security:** Anchor-based constraints prevent unauthorized key modifications, overflow attacks, and double-spend releases.

---

## 🚀 5. Work Delivery & Payment Release Pipeline
* **Deliverable Submissions:** Freelancers submit completed milestones directly on-chain, attaching text briefs or IPFS hash CIDs.
* **Milestone Release Execution:** Clients review submitted work and trigger on-chain milestone payouts. The smart contract releases the allocated USDC balance from the PDA vault to the freelancer.
* **Automated Auto-Release Scheduler:** In the event of client unresponsiveness, an automated off-chain cron watcher triggers contract-level payouts 14 days post-submission, ensuring freelancers are compensated.

---

## ⚖️ 6. Dispute Resolution & AI Arbitration Center
* **On-Chain Dispute Freezing:** Either party can raise a dispute, which locks the contested milestone funds in the PDA vault.
* **Wallet-Signed Witness Statements:** Evidence submitted in dispute chat rooms is cryptographically signed using Ed25519 keys, proving authorship and authenticity.
* **Rule-Based NLP Arbitration Classifier:** The AI resolver parses dispute chats for indicators of delivery delays, communications blackouts, or completeness to output a recommended split (e.g., *70% Client, 30% Freelancer*), alongside confidence scores and rationale.
* **Manual Override Governance:** Authorized DAO moderators or arbitrators can override recommendations to settle payouts directly on-chain if mutual consensus fails.
