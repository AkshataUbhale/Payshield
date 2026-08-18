export interface PlatformRuleDoc {
  id: string;
  title: string;
  category: "escrow" | "milestone" | "cancellation" | "dispute" | "code_quality";
  content: string;
  keywords: string[];
}

export const PLATFORM_RULES: PlatformRuleDoc[] = [
  {
    id: "RULE-ESCROW-001",
    title: "On-Chain Escrow Deposit & Lock Mechanism",
    category: "escrow",
    content: "All client funds for project milestones are deposited into a decentralized Solana Program Derived Address (PDA) escrow vault. Funds cannot be unilaterally seized or refunded without milestone approval, mutual mutual agreement, or an official AI/governance arbitration resolution.",
    keywords: ["escrow", "deposit", "lock", "vault", "pda", "solana", "security"]
  },
  {
    id: "RULE-ESCROW-002",
    title: "Milestone Release Criteria & Verification",
    category: "milestone",
    content: "A milestone is deemed complete when all agreed deliverables are uploaded, verifiable on GitHub/IPFS, and pass agreed acceptance criteria. Clients have a 7-day review window to accept deliverables or request revisions. If no action is taken within 7 days, funds auto-release to the freelancer.",
    keywords: ["milestone", "release", "review window", "auto-release", "acceptance criteria", "deliverables"]
  },
  {
    id: "RULE-DISP-001",
    title: "Dispute Raising & Evidence Submission",
    category: "dispute",
    content: "Either party may raise a dispute during an active milestone. When a dispute is triggered, escrow release is halted. Both parties must submit on-chain or wallet-signed evidence (chat logs, GitHub commits, test results) within 72 hours. The AI Arbitrator analyses evidence against historical precedents.",
    keywords: ["dispute", "evidence", "freeze", "arbitration", "lock", "signature", "deadline"]
  },
  {
    id: "RULE-CODE-001",
    title: "Proof of Work & Code Quality Standards",
    category: "code_quality",
    content: "For software deliverables, code must be pushed to the designated GitHub repository. Commits must reflect meaningful progress corresponding to milestone specifications. Non-compiling code, mock code without business logic, or copied templates without requested customizations constitute a material breach.",
    keywords: ["github", "code quality", "commits", "proof of work", "repository", "buggy code", "tests"]
  },
  {
    id: "RULE-CANCEL-001",
    title: "Project Cancellation & Partial Refund Formula",
    category: "cancellation",
    content: "If a project is cancelled before milestone completion: if zero work was submitted and the deadline elapsed, client receives 100% refund. If partial verified work exists, the AI assesses percentage completion based on commits and PR diffs, allocating proportional payment to the freelancer and refunding the remainder.",
    keywords: ["cancellation", "refund", "partial delivery", "abandonment", "split"]
  },
  {
    id: "RULE-COMM-001",
    title: "Communication & Unresponsive Party Penalties",
    category: "dispute",
    content: "If a freelancer or client ceases communication for more than 5 consecutive business days during an active dispute or critical milestone review, the unresponsive party defaults, and the AI Arbitrator awards a default split favorable to the cooperating party.",
    keywords: ["ghosting", "unresponsive", "communication", "default", "penalty", "blackout"]
  }
];
