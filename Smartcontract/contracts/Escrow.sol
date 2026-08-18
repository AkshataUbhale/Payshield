// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayShield Escrow
 * @author PayShield Team
 * @notice Trustless escrow contract for freelance payments.
 *
 *  Flow:
 *   1. Client deploys, sending ETH (locked in escrow).
 *   2. Freelancer submits work — stores IPFS hash on-chain.
 *   3. Client approves → funds released to freelancer.
 *      OR
 *      Client/freelancer raises dispute → arbitrator resolves.
 */
contract Escrow {

    // ── State ──────────────────────────────────────────────────────────────

    address public client;
    address public freelancer;
    address public arbitrator;
    uint256 public amount;

    string  public ipfsDeliverableHash;
    string  public projectTitle;

    bool public workSubmitted;
    bool public approved;
    bool public disputed;
    bool public resolved;

    uint256 public createdAt;
    uint256 public deadline;

    // ── Events ─────────────────────────────────────────────────────────────

    event WorkSubmitted(address indexed by, string ipfsHash, uint256 timestamp);
    event PaymentApproved(address indexed client, address indexed freelancer, uint256 amount);
    event DisputeRaised(address indexed by, uint256 timestamp);
    event DisputeResolved(address indexed arbitrator, bool paidFreelancer, uint256 timestamp);
    event Refunded(address indexed client, uint256 amount);

    // ── Modifiers ──────────────────────────────────────────────────────────

    modifier onlyClient()     { require(msg.sender == client,     "Only client");     _; }
    modifier onlyFreelancer() { require(msg.sender == freelancer, "Only freelancer"); _; }
    modifier onlyArbitrator() { require(msg.sender == arbitrator, "Only arbitrator"); _; }
    modifier notDisputed()    { require(!disputed, "Dispute open");                   _; }
    modifier notResolved()    { require(!resolved, "Already resolved");               _; }

    // ── Constructor ────────────────────────────────────────────────────────

    /**
     * @param _freelancer Wallet address of the freelancer.
     * @param _arbitrator Neutral arbitrator address (e.g. PayShield DAO).
     * @param _projectTitle Short project description stored on-chain.
     * @param _deadlineDays Number of days before client can claim a refund.
     */
    constructor(
        address _freelancer,
        address _arbitrator,
        string memory _projectTitle,
        uint256 _deadlineDays
    ) payable {
        require(msg.value > 0, "Must lock non-zero amount");
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != msg.sender, "Client and freelancer must differ");

        client      = msg.sender;
        freelancer  = _freelancer;
        arbitrator  = _arbitrator;
        amount      = msg.value;
        projectTitle = _projectTitle;
        createdAt   = block.timestamp;
        deadline    = block.timestamp + (_deadlineDays * 1 days);
    }

    // ── Freelancer Actions ─────────────────────────────────────────────────

    /**
     * @notice Freelancer submits work by recording the IPFS CID on-chain.
     * @param _ipfsHash Content Identifier (CID) of the IPFS-uploaded deliverable.
     */
    function submitWork(string calldata _ipfsHash) external onlyFreelancer notDisputed notResolved {
        require(!workSubmitted, "Work already submitted");
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");

        ipfsDeliverableHash = _ipfsHash;
        workSubmitted = true;

        emit WorkSubmitted(msg.sender, _ipfsHash, block.timestamp);
    }

    // ── Client Actions ─────────────────────────────────────────────────────

    /**
     * @notice Client approves the submitted work and releases payment.
     */
    function approvePayment() external onlyClient notDisputed notResolved {
        require(workSubmitted, "Work not yet submitted");

        approved = true;
        resolved = true;

        payable(freelancer).transfer(amount);

        emit PaymentApproved(client, freelancer, amount);
    }

    /**
     * @notice Client raises a dispute, freezing the escrow.
     */
    function raiseDispute() external onlyClient notResolved {
        require(workSubmitted, "Cannot dispute before work submission");
        require(!disputed, "Dispute already open");

        disputed = true;

        emit DisputeRaised(msg.sender, block.timestamp);
    }

    /**
     * @notice Client claims a full refund if deadline has passed and no work was submitted.
     */
    function claimRefund() external onlyClient notDisputed notResolved {
        require(!workSubmitted, "Work was submitted; cannot refund");
        require(block.timestamp > deadline, "Deadline not reached yet");

        resolved = true;

        payable(client).transfer(amount);

        emit Refunded(client, amount);
    }

    // ── Arbitrator Actions ─────────────────────────────────────────────────

    /**
     * @notice Neutral arbitrator resolves dispute.
     * @param payFreelancer If true, pay freelancer; otherwise refund client.
     */
    function resolveDispute(bool payFreelancer) external onlyArbitrator notResolved {
        require(disputed, "No active dispute");

        resolved = true;

        if (payFreelancer) {
            payable(freelancer).transfer(amount);
        } else {
            payable(client).transfer(amount);
        }

        emit DisputeResolved(msg.sender, payFreelancer, block.timestamp);
    }

    // ── View ───────────────────────────────────────────────────────────────

    /**
     * @notice Returns the full escrow state at once.
     */
    function getDetails() external view returns (
        address _client, address _freelancer, uint256 _amount,
        bool _workSubmitted, bool _approved, bool _disputed, bool _resolved,
        string memory _ipfsHash, string memory _title, uint256 _deadline
    ) {
        return (
            client, freelancer, amount,
            workSubmitted, approved, disputed, resolved,
            ipfsDeliverableHash, projectTitle, deadline
        );
    }

    /// @notice Contract balance (should match `amount` until resolved).
    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}
