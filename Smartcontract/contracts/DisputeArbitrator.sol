// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayShield Dispute Arbitrator
 * @author PayShield Team
 * @notice Manages on-chain dispute resolution for PayShield Escrow contracts.
 *
 *  The arbitrator can:
 *   - Register disputes from Escrow contracts
 *   - Cast a resolution verdict
 *   - Transfer ownership to a new arbitrator (DAO governance ready)
 */

interface IEscrow {
    function resolveDispute(bool payFreelancer) external;
}

contract DisputeArbitrator {

    // ── State ──────────────────────────────────────────────────────────────

    address public owner;

    enum Status { Pending, Resolved, Dismissed }

    struct DisputeCase {
        address escrowContract;
        address raisedBy;
        string  evidenceIPFSHash;
        string  description;
        Status  status;
        bool    verdictForFreelancer;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    uint256 public caseCount;
    mapping(uint256 => DisputeCase) public cases;
    mapping(address => uint256)     public escrowToCase; // escrow → case ID
    mapping(address => bool)        public registeredArbitrators;

    // ── Events ─────────────────────────────────────────────────────────────

    event CaseOpened(uint256 indexed caseId, address indexed escrowContract, address raisedBy);
    event CaseResolved(uint256 indexed caseId, bool verdictForFreelancer, address arbitrator);
    event CaseDismissed(uint256 indexed caseId, address arbitrator);
    event ArbitratorAdded(address arbitrator);
    event ArbitratorRemoved(address arbitrator);

    // ── Modifiers ──────────────────────────────────────────────────────────

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyArbitrator() {
        require(registeredArbitrators[msg.sender] || msg.sender == owner, "Not arbitrator");
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        registeredArbitrators[msg.sender] = true;
    }

    // ── Case Management ────────────────────────────────────────────────────

    /**
     * @notice Open a new dispute case. Called by a PayShield Escrow contract.
     * @param escrowContract Address of the Escrow contract with frozen funds.
     * @param evidenceHash IPFS CID containing dispute evidence.
     * @param description Short description of the dispute.
     */
    function openCase(
        address escrowContract,
        string calldata evidenceHash,
        string calldata description
    ) external returns (uint256 caseId) {
        require(escrowContract != address(0), "Invalid escrow");
        require(escrowToCase[escrowContract] == 0, "Case already open");

        caseCount++;
        caseId = caseCount;

        cases[caseId] = DisputeCase({
            escrowContract:     escrowContract,
            raisedBy:           msg.sender,
            evidenceIPFSHash:   evidenceHash,
            description:        description,
            status:             Status.Pending,
            verdictForFreelancer: false,
            createdAt:          block.timestamp,
            resolvedAt:         0
        });

        escrowToCase[escrowContract] = caseId;

        emit CaseOpened(caseId, escrowContract, msg.sender);
    }

    /**
     * @notice Resolve a dispute case and trigger payment on the Escrow contract.
     * @param caseId The case to resolve.
     * @param payFreelancer True → freelancer receives funds; False → client refunded.
     */
    function resolveCase(uint256 caseId, bool payFreelancer) external onlyArbitrator {
        DisputeCase storage c = cases[caseId];
        require(c.status == Status.Pending, "Case not pending");

        c.status              = Status.Resolved;
        c.verdictForFreelancer = payFreelancer;
        c.resolvedAt          = block.timestamp;

        // Trigger resolution in the linked Escrow contract.
        IEscrow(c.escrowContract).resolveDispute(payFreelancer);

        emit CaseResolved(caseId, payFreelancer, msg.sender);
    }

    /**
     * @notice Dismiss a frivolous or invalid case.
     * @param caseId The case to dismiss.
     */
    function dismissCase(uint256 caseId) external onlyArbitrator {
        DisputeCase storage c = cases[caseId];
        require(c.status == Status.Pending, "Case not pending");
        c.status = Status.Dismissed;
        c.resolvedAt = block.timestamp;
        emit CaseDismissed(caseId, msg.sender);
    }

    // ── Arbitrator Management ──────────────────────────────────────────────

    function addArbitrator(address arb) external onlyOwner {
        registeredArbitrators[arb] = true;
        emit ArbitratorAdded(arb);
    }

    function removeArbitrator(address arb) external onlyOwner {
        registeredArbitrators[arb] = false;
        emit ArbitratorRemoved(arb);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    // ── View ───────────────────────────────────────────────────────────────

    function getCase(uint256 caseId) external view returns (DisputeCase memory) {
        return cases[caseId];
    }

    function getCaseByEscrow(address escrow) external view returns (DisputeCase memory) {
        return cases[escrowToCase[escrow]];
    }
}
