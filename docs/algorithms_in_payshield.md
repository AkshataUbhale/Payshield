# 🔐 Payshield — All Algorithms: Purpose & Pseudocode

Payshield is a **decentralized freelance marketplace** built on Solana. Below is a complete catalog of every algorithm/mechanism used across the backend (`src/`), smart contract (`solanahub_protocol/`), and frontend (`client_vite/`).

---

## 1. 🔑 Wallet-Based Authentication (Challenge-Response / Nonce Auth)

**Location**: [`authController.ts`](file:///Users/akshata/Desktop/Payshield/src/controllers/authController.ts) · [`authMiddleware.ts`](file:///Users/akshata/Desktop/Payshield/src/middleware/authMiddleware.ts)

**Purpose**: Authenticate users using their Solana wallet keypair without a password. The server challenges the client with a one-time nonce; the client signs it; the server verifies the Ed25519 signature.

**Libraries Used**: `tweetnacl` (Ed25519), `bs58` (Base58 decode), `crypto` (nonce generation), `jsonwebtoken` (JWT)

```
PSEUDOCODE — getNonce():
  INPUT: publicKey
  nonce ← crypto.randomBytes(32).toString("hex")   // 64-char hex nonce
  upsert User(publicKey, nonce) in DB
  RETURN nonce

PSEUDOCODE — login():
  INPUT: publicKey, signature (Base58)
  user ← DB.findUser(publicKey)
  nonceBytes ← TextEncoder.encode(user.nonce)
  sigBytes   ← bs58.decode(signature)
  pubKeyBytes ← bs58.decode(publicKey)

  verified ← nacl.sign.detached.verify(nonceBytes, sigBytes, pubKeyBytes)
  IF NOT verified → RETURN 401 "Invalid signature"

  // Issue JWT
  token ← jwt.sign({ id: publicKey, role: user.role }, JWT_SECRET, { expiresIn: "24h" })
  user.nonce ← newNonce()   // rotate nonce → prevent replay attacks
  RETURN { token, user }

PSEUDOCODE — authMiddleware():
  token ← req.header("Authorization").replace("Bearer ", "")
  decoded ← jwt.verify(token, JWT_SECRET)
  req.user ← decoded.user
  next()
```

> **Why used**: Passwordless, trustless login — only the wallet owner can sign the nonce. Nonce rotation prevents replay attacks.

---

## 2. 🤖 AI Job Recommendation Engine (Weighted Scoring)

**Location**: [`aiController.ts`](file:///Users/akshata/Desktop/Payshield/src/controllers/aiController.ts#L14-L98)

**Purpose**: Match freelancers to open projects using a multi-criteria weighted score combining skill overlap, budget fit, and category match.

```
PSEUDOCODE — getRecommendedJobs(freelancer):
  openProjects ← DB.find(status = "open")
  
  FOR each project IN openProjects:
    projectText ← project.title + project.description (lowercase)

    // 1. Skill Overlap — 60% weight
    matchedSkills ← freelancer.skills FILTER skill IN projectText
    skillScore ← (matchedSkills.count / max(1, freelancer.skills.count)) * 100

    // 2. Budget Match — 20% weight
    expectedSize ← freelancer.hourlyRate * 20
    IF project.budget < expectedSize:
      budgetScore ← (project.budget / expectedSize) * 100
    ELSE:
      budgetScore ← 100 - ((project.budget - expectedSize) / expectedSize) * 20
    budgetScore ← clamp(budgetScore, 0, 100)

    // 3. Category Match — 20% weight
    categoryScore ← 50  // default
    FOR cat IN ["frontend","backend","blockchain","design",...]:
      IF cat IN projectText AND cat IN freelancer.skills:
        categoryScore ← 100; BREAK

    // Weighted Total
    matchScore ← (skillScore * 0.6) + (budgetScore * 0.2) + (categoryScore * 0.2)
    APPEND { project, matchScore, matchedSkills }

  SORT recommendations BY matchScore DESC
  RETURN recommendations
```

> **Why used**: Provides personalized job discovery without an expensive ML model — a fast, explainable heuristic scoring system.

---

## 3. 🤝 AI Freelancer Recommendation Engine (Weighted Scoring)

**Location**: [`aiController.ts`](file:///Users/akshata/Desktop/Payshield/src/controllers/aiController.ts#L103-L177)

**Purpose**: Help clients find the best freelancer for their project using skill fit, rating history, and rate compatibility.

```
PSEUDOCODE — getRecommendedFreelancers(project):
  freelancers ← DB.find(role = "freelancer")
  projectText ← project.title + project.description (lowercase)

  FOR each freelancer IN freelancers:
    matchedSkills ← freelancer.skills FILTER skill IN projectText

    // 1. Skill Overlap — 50% weight
    skillScore ← (matchedSkills.count / max(1, freelancer.skills.count)) * 100

    // 2. Rating + Completed Jobs — 30% weight
    ratingScore ← freelancer.rating * 20        // 5 stars → 100
    completedScore ← min(100, freelancer.completedJobs * 10)
    historyScore ← (ratingScore * 0.7) + (completedScore * 0.3)

    // 3. Rate Fit — 20% weight
    hourlyEquivalent ← project.budget / 30
    IF freelancer.hourlyRate > hourlyEquivalent:
      rateScore ← (hourlyEquivalent / freelancer.hourlyRate) * 100
    ELSE:
      rateScore ← 100

    matchScore ← (skillScore * 0.5) + (historyScore * 0.3) + (rateScore * 0.2)
    APPEND { freelancer, matchScore, matchedSkills }

  SORT recommendations BY matchScore DESC
  RETURN recommendations
```

> **Why used**: Gives clients a ranked, explainable shortlist of freelancers without requiring manual search.

---

## 4. ⚖️ AI Dispute Arbitration (Rule-Based NLP Classifier)

**Location**: [`aiController.ts`](file:///Users/akshata/Desktop/Payshield/src/controllers/aiController.ts#L334-L411)

**Purpose**: Automatically analyze dispute messages using keyword-based NLP to suggest a fair escrow split between client and freelancer.

```
PSEUDOCODE — arbitrateDisputeWithAI(disputeId):
  dispute ← DB.findDispute(disputeId)
  allText ← CONCAT(dispute.messages[].text).toLowerCase()

  // Default: 50/50 equitable split
  splitFreelancer ← 50
  splitClient     ← 50
  confidence      ← 85

  // Rule-based NLP pattern matching
  IF "delay" OR "late" OR "missing" IN allText:
    splitFreelancer ← 30
    splitClient     ← 70
    confidence      ← 90
    rationale       ← "Delivery delays / missing requirements detected"

  ELSE IF "perfect" OR "delivered" OR "completed" OR "code is done" IN allText:
    splitFreelancer ← 80
    splitClient     ← 20
    confidence      ← 93
    rationale       ← "High delivery completeness found"

  ELSE IF "ghost" OR "ignored" OR "no reply" IN allText:
    splitFreelancer ← 10
    splitClient     ← 90
    confidence      ← 95
    rationale       ← "Freelancer communication blackout detected"

  dispute.aiResolution ← { splitFreelancer, splitClient, confidence, rationale }
  dispute.status ← "resolved_by_ai"
  SAVE dispute
  RETURN dispute
```

> **Why used**: Removes human bias from dispute resolution; provides instant, transparent AI-driven verdicts with audit trails on the blockchain.

---

## 5. 🔏 Ed25519 Cryptographic Signature Verification

**Location**: [`aiController.ts`](file:///Users/akshata/Desktop/Payshield/src/controllers/aiController.ts#L286-L303) (Dispute messages)

**Purpose**: Verify that dispute messages are cryptographically signed by the sender's wallet, proving authenticity and preventing impersonation.

```
PSEUDOCODE — verifyDisputeMessageSignature(message, signature, publicKey):
  messageBytes  ← TextEncoder.encode(message)
  sigBytes      ← bs58.decode(signature)     // Base58 → Uint8Array
  pubKeyBytes   ← bs58.decode(publicKey)

  isVerified ← nacl.sign.detached.verify(messageBytes, sigBytes, pubKeyBytes)
  
  IF isVerified:
    APPEND "[🔒 Wallet Signed]" to message
    auditLog ← "CRYPTOGRAPHICALLY VERIFIED"
  ELSE:
    auditLog ← "UNVERIFIED STATEMENT"

  RETURN isVerified
```

> **Why used**: On-chain trustlessness — evidence submitted in disputes is cryptographically proven to originate from the wallet owner.

---

## 6. ⛓️ Smart Contract Escrow Mechanism (PDA-Based Fund Locking)

**Location**: [`initialize_escrow.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/initialize_escrow.rs)

**Purpose**: Lock USDC funds from the client into a program-derived escrow vault, mapped to per-milestone amounts, so neither party can steal funds.

```
PSEUDOCODE — handler_initialize_escrow(projectId, milestoneAmounts):
  project ← PDA["project", projectId]
  escrow  ← PDA["escrow", projectId]   // new account

  // Validation
  totalMilestoneAmount ← SUM(milestoneAmounts)
  ASSERT totalMilestoneAmount == project.total_budget   // amounts must balance
  ASSERT milestoneAmounts.len == project.milestone_count

  // Initialize escrow state
  escrow.project_id        ← projectId
  escrow.client            ← project.client
  escrow.freelancer        ← project.freelancer
  escrow.total_amount      ← project.total_budget
  escrow.amount_released   ← 0
  escrow.milestone_amounts ← milestoneAmounts

  // CPI: Transfer USDC from client ATA → escrow vault ATA
  token::transfer(client_ata → escrow_vault, project.total_budget)

  project.status ← InProgress
  EMIT EscrowInitializedEvent
```

> **Why used**: Trustless payment guarantee — the freelancer knows funds are locked, the client knows they're safe until work is approved.

---

## 7. 📊 On-Chain Reputation Scoring with Badge System (Incremental Average)

**Location**: [`submit_review.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/submit_review.rs)

**Purpose**: Maintain a running average reputation score for each user on-chain. Award badge flags using bitwise OR when thresholds are met.

```
PSEUDOCODE — handler_submit_review(projectId, rating, commentHash):
  ASSERT reviewer ∈ {project.client, project.freelancer}
  ASSERT target   ≠ reviewer (must be the counterparty)
  ASSERT 1 ≤ rating ≤ 5

  reputation.total_reviews += 1
  reputation.total_score   += rating

  // Incremental integer average (×10 for 1 decimal place)
  reputation.average_rating ← (total_score * 10) / total_reviews
  // e.g., 4.5 stars stored as 45

  // Badge Unlocking via Bitwise Flags
  IF average_rating ≥ 45 AND total_reviews > 5:
    reputation.badges |= BADGE_TOP_RATED    // set bit 0

  IF total_reviews > 20:
    reputation.badges |= BADGE_VETERAN      // set bit 1
```

> **Why used**: Fixed-size on-chain storage — no array of reviews needed. Incremental averaging is O(1) and gas-efficient.

---

## 8. ⏱️ Time-Lock Auto-Release Algorithm

**Location**: [`process_auto_release.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/process_auto_release.rs)

**Purpose**: Automatically release milestone funds to the freelancer if the client does not respond within 7 days of deliverable submission.

```
PSEUDOCODE — handler_process_auto_release(milestoneIndex):
  clock        ← Solana Clock (current Unix timestamp)
  submittedAt  ← milestone.submitted_at
  SEVEN_DAYS   ← 7 * 24 * 60 * 60   // seconds

  ASSERT milestone.status == Submitted
  
  IF clock.unix_timestamp < submittedAt + SEVEN_DAYS:
    RETURN ERROR "AutoReleaseNotReady"

  // 7 days elapsed → release funds
  milestone.status         ← Released
  escrow.amount_released   += milestone.amount

  EMIT MilestoneReleasedEvent
```

> **Why used**: Protects freelancers from clients who ghost after receiving work — ensures automatic fair payment without manual intervention.

---

## 9. 🗳️ Community Voting Mechanism (Dispute DAO)

**Location**: [`cast_vote.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/cast_vote.rs) · [`execute_verdict.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/execute_verdict.rs)

**Purpose**: Allow community jurors to vote on disputes that AI cannot resolve. Intended simple-majority voting logic.

```
PSEUDOCODE — handler_cast_vote(vote):
  ASSERT dispute.status == Voting

  // Record vote
  dispute.votes_client     += (vote == Client ? 1 : 0)
  dispute.votes_freelancer += (vote == Freelancer ? 1 : 0)

  // Check for majority (JUROR_COUNT defined in constants)
  IF votes_client > JUROR_COUNT / 2:
    dispute.status ← ResolvedClient
  ELSE IF votes_freelancer > JUROR_COUNT / 2:
    dispute.status ← ResolvedFreelancer

  // execute_verdict() → transfer funds according to verdict
```

> **Why used**: Provides a decentralized fallback when AI arbitration is insufficient — community governance layer.

---

## 10. 💰 Token Staking Algorithm

**Location**: [`stake.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/stake.rs)

**Purpose**: Allow users to lock tokens in a staking vault to demonstrate commitment, boost reputation, or gain platform privileges.

```
PSEUDOCODE — handler_stake(amount):
  // CPI: Transfer tokens from user → staking vault
  token::transfer(user_token_account → staking_vault, amount)

  IF user_stake.amount == 0:
    user_stake.user ← user.key()   // initialize record

  user_stake.amount += amount           // accumulate stake
  user_stake.since  ← clock.timestamp  // record stake time

  // Future: calculate staking rewards using time-weighted formula:
  // reward = amount * (current_time - since) * rate_per_second
```

> **Why used**: Skin-in-the-game mechanism — stakers have economic incentive to behave honestly on the platform.

---

## 11. 🧩 Skill Matching Score (Frontend Utility)

**Location**: [`helpers.js`](file:///Users/akshata/Desktop/Payshield/client_vite/src/utils/helpers.js#L37-L43)

**Purpose**: Frontend client-side quick match score calculation for UI display before API results arrive.

```
PSEUDOCODE — getMatchScore(jobSkills, freelancerSkills):
  jSkills ← jobSkills.map(toLowerTrim)
  fSkills ← freelancerSkills.map(toLowerTrim)
  
  matches ← jSkills FILTER skill IN fSkills
  
  IF jSkills.length > 0:
    RETURN round((matches.length / jSkills.length) * 100)
  ELSE:
    RETURN 0
```

> **Why used**: Fast O(n) set intersection for real-time UI feedback on job compatibility without a server round-trip.

---

## 12. 🕐 Relative Time Calculation

**Location**: [`helpers.js`](file:///Users/akshata/Desktop/Payshield/client_vite/src/utils/helpers.js#L18-L34)

**Purpose**: Convert timestamps to human-readable relative time ("5m ago", "2h ago", "3d left") for UX.

```
PSEUDOCODE — timeAgo(dateStr):
  diff ← Date.now() - new Date(dateStr)   // milliseconds
  mins ← floor(diff / 60000)
  IF mins < 60: RETURN "{mins}m ago"
  hrs  ← floor(mins / 60)
  IF hrs < 24:  RETURN "{hrs}h ago"
  days ← floor(hrs / 24)
  RETURN "{days}d ago"

PSEUDOCODE — daysLeft(deadline):
  diff ← new Date(deadline) - Date.now()
  days ← ceil(diff / 86400000)
  IF days < 0:  RETURN "Overdue"
  IF days == 0: RETURN "Due today"
  RETURN "{days}d left"
```

> **Why used**: Standard UX pattern for deadline visibility and activity feed timestamps.

---

## 13. 🔒 Merkle / Hash Anchoring (Content Integrity)

**Location**: [`lib.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/lib.rs), [`raise_dispute.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/raise_dispute.rs), [`send_message.rs`](file:///Users/akshata/Desktop/Payshield/solanahub_protocol/programs/solanahub_protocol/src/instructions/send_message.rs)

**Purpose**: Store 32-byte SHA-256 hashes of content (descriptions, messages, deliverables, reviews) on-chain to prove integrity without storing full text.

```
PSEUDOCODE — submitDeliverable(milestoneIndex, deliverableHash):
  // Client side: hash = SHA256(fileContent or IPFS CID)
  deliverableHash ← SHA256(deliverable_data)  // 32 bytes

  // On-chain: store the hash, not the data
  milestone.deliverable_hash ← deliverableHash
  milestone.status           ← Submitted

PSEUDOCODE — verifyIntegrity(data, storedHash):
  computedHash ← SHA256(data)
  RETURN computedHash == storedHash   // tamper-proof check
```

> **Why used**: Solana accounts have fixed storage — full text is stored off-chain (IPFS/MongoDB), only the hash is anchored on-chain for trustless verification.

---

## 📋 Summary Table

| # | Algorithm | Layer | Category |
|---|-----------|-------|----------|
| 1 | Wallet Nonce Auth (Ed25519 + JWT) | Backend | Cryptography / Auth |
| 2 | AI Job Recommendation (Weighted Score) | Backend | AI / Scoring |
| 3 | AI Freelancer Recommendation (Weighted Score) | Backend | AI / Scoring |
| 4 | AI Dispute Arbitration (NLP Rule Engine) | Backend | AI / NLP |
| 5 | Cryptographic Signature Verification | Backend | Cryptography |
| 6 | PDA Escrow Fund Locking | Smart Contract | Blockchain / Finance |
| 7 | On-Chain Reputation (Incremental Avg + Bitwise Badges) | Smart Contract | Scoring / State |
| 8 | Time-Lock Auto-Release | Smart Contract | Blockchain / Time |
| 9 | Community Voting (Majority DAO) | Smart Contract | Governance |
| 10 | Token Staking | Smart Contract | DeFi / Incentives |
| 11 | Skill Matching Score | Frontend | Utility / Scoring |
| 12 | Relative Time Calculation | Frontend | Utility / UX |
| 13 | Content Hash Anchoring (SHA-256) | Smart Contract | Cryptography / Integrity |
