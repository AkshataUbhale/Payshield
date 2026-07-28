# SolanaHub Protocol

<div align="center">

[![Anchor](https://img.shields.io/badge/Anchor-0.30+-blueviolet?style=for-the-badge&logo=anchor)](https://www.anchor-lang.com/)
[![Rust](https://img.shields.io/badge/Rust-1.75+-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)

Solana smart contracts for decentralized freelance marketplace with escrow, milestones, disputes, and reputation.

**Program ID:** `F65dyNspaW3225BEuJh2W7wnigtdVjxnmeFxXPFr5Rpm`

 - [Features](#features)
 - [Tech Stack](#tech-stack)
 - [Getting Started](#getting-started)
 - [Program Instructions](#program-instructions)
 - [Code Examples](#code-examples)
 - [Documentation](#documentation)

</div>

---

## Features

- **Project Management** - Create and manage freelance projects on-chain
- **Escrow System** - Secure fund locking with milestone-based releases
- **Milestone Tracking** - Submit, approve, and release milestone payments
- **Dispute Resolution** - Community-governed voting for dispute settlement
- **Reputation System** - On-chain reviews and ratings
- **Auto-Release** - Automatic fund release after 7 days
- **Social Features** - Posts, likes, and messaging
- **Token Staking** - Stake for governance participation

---

## Tech Stack

- **Anchor Framework 0.30+** - Solana program development framework
- **Rust 1.75+** - Systems programming language
- **Solana Devnet** - Blockchain network

### Program Statistics

- **Instructions:** 20
- **State Accounts:** 10
- **Network:** Solana Devnet

---

## Getting Started

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.0
avm use 0.30.0
```

### Installation

```bash
cd solanahub_protocol

# Build program
anchor build

# Run tests
anchor test

# Deploy to devnet
solana config set --url devnet
anchor deploy
```

---

## Program Instructions

### Core Instructions

| Instruction          | Description             | Parameters                                                                 |
| -------------------- | ----------------------- | -------------------------------------------------------------------------- |
| `initialize`         | Initialize global state | -                                                                          |
| `create_project`     | Create new project      | title, description_hash, total_budget, milestone_count, deadline, category |
| `assign_freelancer`  | Assign freelancer       | freelancer                                                                 |
| `initialize_escrow`  | Lock funds in escrow    | project_id, milestone_amounts                                              |
| `create_milestone`   | Create milestone        | milestone_index, description_hash, amount                                  |
| `submit_deliverable` | Submit work             | milestone_index, deliverable_hash                                          |
| `approve_milestone`  | Approve work            | milestone_index                                                            |
| `release_milestone`  | Release payment         | milestone_index                                                            |
| `raise_dispute`      | Raise dispute           | project_id, milestone_index, description_hash                              |
| `cast_vote`          | Vote on dispute         | vote                                                                       |
| `submit_review`      | Submit review           | project_id, rating, comment_hash                                           |

---

## Code Examples

### Create Project

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const program = anchor.workspace.SolanahubProtocol;

// Get global state
const [globalStatePDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("global_state")],
  program.programId,
);

const globalState = await program.account.globalState.fetch(globalStatePDA);
const projectId = globalState.totalProjects.toNumber() + 1;

// Derive project PDA
const [projectPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("project"),
    new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
  ],
  program.programId,
);

// Create project
await program.methods
  .createProject(
    "Build DeFi Dashboard",
    Array.from(Buffer.alloc(32)), // IPFS hash
    new anchor.BN(5000 * 1e6), // 5000 USDC
    3, // 3 milestones
    new anchor.BN(Date.now() / 1000 + 2592000), // 30 days
    1, // Category
  )
  .accounts({
    project: projectPDA,
    globalState: globalStatePDA,
    client: wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();
```

### Initialize Escrow

```typescript
const [escrowPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("escrow"),
    new anchor.BN(projectId).toArrayLike(Buffer, "le", 8),
  ],
  program.programId,
);

await program.methods
  .initializeEscrow(new anchor.BN(projectId), [
    new anchor.BN(2000 * 1e6), // Milestone 1: 2000 USDC
    new anchor.BN(2000 * 1e6), // Milestone 2: 2000 USDC
    new anchor.BN(1000 * 1e6), // Milestone 3: 1000 USDC
  ])
  .accounts({
    escrow: escrowPDA,
    project: projectPDA,
    client: wallet.publicKey,
    usdcMint: USDC_MINT,
    clientTokenAccount: clientUsdcAccount,
    escrowTokenAccount: escrowUsdcAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Submit & Approve Milestone

```typescript
// Submit deliverable
await program.methods
  .submitDeliverable(
    0, // milestone_index
    Array.from(Buffer.from("ipfs_hash_of_deliverable")),
  )
  .accounts({
    milestone: milestonePDA,
    project: projectPDA,
    freelancer: wallet.publicKey,
  })
  .rpc();

// Approve milestone (by client)
await program.methods
  .approveMilestone(0)
  .accounts({
    milestone: milestonePDA,
    project: projectPDA,
    client: wallet.publicKey,
  })
  .rpc();

// Release funds
await program.methods
  .releaseMilestone(0)
  .accounts({
    milestone: milestonePDA,
    escrow: escrowPDA,
    project: projectPDA,
    freelancer: freelancerPublicKey,
    escrowTokenAccount: escrowUsdcAccount,
    freelancerTokenAccount: freelancerUsdcAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

---

## State Accounts

### Project

```rust
pub struct Project {
    pub project_id: u64,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub title: String,              // max 128 chars
    pub description_hash: [u8; 32],
    pub total_budget: u64,
    pub milestone_count: u8,
    pub status: ProjectStatus,
    pub created_at: i64,
    pub deadline: i64,
    pub category: u8,
}

pub enum ProjectStatus {
    Open,
    Assigned,
    InProgress,
    Completed,
    Disputed,
    Cancelled,
}
```

### Milestone

```rust
pub struct Milestone {
    pub project_id: u64,
    pub milestone_index: u8,
    pub description_hash: [u8; 32],
    pub amount: u64,
    pub status: MilestoneStatus,
    pub deliverable_hash: [u8; 32],
    pub submitted_at: Option<i64>,
    pub approved_at: Option<i64>,
}
```

### Escrow

```rust
pub struct Escrow {
    pub project_id: u64,
    pub total_amount: u64,
    pub released_amount: u64,
}
```

---

## Documentation

### Solana & Anchor

- [Solana Documentation](https://docs.solana.com/) - Official Solana docs
- [Anchor Framework](https://www.anchor-lang.com/docs) - Anchor guide and reference
- [Anchor Book](https://book.anchor-lang.com/) - Comprehensive Anchor tutorial
- [Solana Cookbook](https://solanacookbook.com/) - Code recipes and examples
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/examples) - Official examples

### Rust Programming

- [Rust Book](https://doc.rust-lang.org/book/) - The Rust programming language
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) - Learn Rust with examples

### Solana Program Development

- [Solana Program Library](https://spl.solana.com/) - SPL token and other programs
- [Metaplex Docs](https://docs.metaplex.com/) - NFT and metadata standards
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) - JavaScript SDK

### Testing & Tools

- [Anchor Testing](https://www.anchor-lang.com/docs/testing) - Testing guide
- [Solana Explorer](https://explorer.solana.com/) - Blockchain explorer
- [Solana CLI Reference](https://docs.solana.com/cli) - CLI commands

---

## Security Features

### Access Control

All instructions validate authority using Anchor constraints:

```rust
#[account(
    mut,
    constraint = project.client == client.key() @ ErrorCode::Unauthorized
)]
pub project: Account<'info, Project>,
```

### Auto-Release Protection

Milestones auto-release after 7 days if not approved:

```rust
require!(
    clock.unix_timestamp >= milestone.submitted_at.unwrap() + 7 * 24 * 60 * 60,
    ErrorCode::AutoReleaseNotReady
);
```

---

**Built with Rust and Anchor Framework**
