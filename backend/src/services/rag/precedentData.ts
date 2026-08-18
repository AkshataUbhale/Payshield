export interface DisputePrecedent {
  id: string;
  title: string;
  category: "late_delivery" | "buggy_code" | "scope_creep" | "ghosting" | "partial_delivery" | "spec_deviation";
  caseSummary: string;
  evidenceSummary: string;
  clientSplitPercent: number;
  freelancerSplitPercent: number;
  rulingRationale: string;
  applicableRules: string[];
  keywords: string[];
}

export const DISPUTE_PRECEDENTS: DisputePrecedent[] = [
  {
    id: "PREC-WEB3-001",
    title: "Case 104: Severe Delivery Delay without Justification",
    category: "late_delivery",
    caseSummary: "Freelancer missed project delivery milestone by 14 days without prior notice or extension agreement. Client requested full refund.",
    evidenceSummary: "GitHub commit history showed no repository activity for 3 weeks leading up to deadline. Client sent 4 reminders with minimal response.",
    clientSplitPercent: 85,
    freelancerSplitPercent: 15,
    rulingRationale: "Freelancer breached deadline obligations under platform rules. 15% allocated for initial architectural scaffolding found in early commits; 85% returned to client due to material timeline breach.",
    applicableRules: ["RULE-ESCROW-002", "RULE-CANCEL-001"],
    keywords: ["late", "delay", "missed deadline", "no communication", "overdue", "refund"]
  },
  {
    id: "PREC-WEB3-002",
    title: "Case 112: Non-Functional Smart Contract & Failing Unit Tests",
    category: "buggy_code",
    caseSummary: "Freelancer delivered Solana Anchor smart contract milestone, but contract failed security audit and basic integration tests.",
    evidenceSummary: "Anchor test suite failed 8 out of 12 tests. Critical reentrancy risk and unhandled arithmetic errors present in PR diff.",
    clientSplitPercent: 75,
    freelancerSplitPercent: 25,
    rulingRationale: "Deliverable failed baseline acceptance standards. 25% credited for boilerplate structure and account schema; 75% refunded to client due to non-functional state requiring external refactoring.",
    applicableRules: ["RULE-CODE-001"],
    keywords: ["buggy", "broken", "tests failing", "audit failure", "anchor error", "errors", "defects"]
  },
  {
    id: "PREC-WEB3-003",
    title: "Case 128: Scope Creep vs. Contract Agreement",
    category: "scope_creep",
    caseSummary: "Client refused to release milestone funds, demanding additional features not listed in original milestone statement of work.",
    evidenceSummary: "Signed milestone agreement specified 3 React pages. Client demanded 6 pages and third-party CRM integration before releasing escrow.",
    clientSplitPercent: 10,
    freelancerSplitPercent: 90,
    rulingRationale: "Freelancer fulfilled 100% of the agreed-upon specification in the milestone contract. Client-requested additions constitute out-of-scope work that requires a separate milestone.",
    applicableRules: ["RULE-ESCROW-002", "RULE-CODE-001"],
    keywords: ["scope creep", "extra work", "client demanding more", "out of scope", "unreasonable revision"]
  },
  {
    id: "PREC-WEB3-004",
    title: "Case 145: Complete Freelancer Communication Blackout (Ghosting)",
    category: "ghosting",
    caseSummary: "Freelancer stopped responding to messages for 10 consecutive days during escrow milestone. Milestone expired with no pull requests submitted.",
    evidenceSummary: "Platform chat showed 0 replies to 6 client inquiries. GitHub repo had 0 commits created.",
    clientSplitPercent: 100,
    freelancerSplitPercent: 0,
    rulingRationale: "Unresponsive default triggered under platform terms. Zero proof of work rendered. 100% of escrowed funds refunded to client.",
    applicableRules: ["RULE-COMM-001", "RULE-CANCEL-001"],
    keywords: ["ghosting", "unresponsive", "ignored", "no reply", "blackout", "abandoned"]
  },
  {
    id: "PREC-WEB3-005",
    title: "Case 162: Substantial Performance with Minor Cosmetic Discrepancies",
    category: "partial_delivery",
    caseSummary: "Freelancer delivered full-stack payment gateway. Client disputed full milestone payment citing color palette differences and minor padding issues.",
    evidenceSummary: "All core smart contracts, API routes, and UI forms verified functional on testnet. Only CSS style adjustments remained.",
    clientSplitPercent: 10,
    freelancerSplitPercent: 90,
    rulingRationale: "Substantial performance achieved. Core value and complex technical milestones are fully operational. 90% released to freelancer with 10% reserved for 48h UI polish.",
    applicableRules: ["RULE-ESCROW-002", "RULE-CODE-001"],
    keywords: ["minor issue", "cosmetic", "styling", "substantial completion", "functional", "almost done"]
  },
  {
    id: "PREC-WEB3-006",
    title: "Case 180: Mutual Misunderstanding & Ambiguous Specifications",
    category: "spec_deviation",
    caseSummary: "Client and freelancer had conflicting interpretations of 'real-time indexing'. Freelancer built WebSocket listener, client expected GraphQL subgraph.",
    evidenceSummary: "Original contract wording was ambiguous. Both parties acted in good faith; freelancer wrote high quality code, but it did not fit client's backend architecture.",
    clientSplitPercent: 50,
    freelancerSplitPercent: 50,
    rulingRationale: "Equitable 50/50 split. Both parties contributed to ambiguity. Freelancer retains compensation for labor and intellectual property; client recovers capital to realign architecture.",
    applicableRules: ["RULE-ESCROW-001", "RULE-CANCEL-001"],
    keywords: ["misunderstanding", "ambiguous", "good faith", "split", "50/50", "mutual fault"]
  }
];
