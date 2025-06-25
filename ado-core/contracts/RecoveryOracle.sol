// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RecoveryOracle
/// @notice Tracks shard approvals for vault recovery.
contract RecoveryOracle {
    /// ---------------------------------------------------------------------
    /// Storage
    /// ---------------------------------------------------------------------

    /// @notice Deployer with administrative control over shard holders
    address public owner;

    /// @notice Address that initiated the latest recovery process
    address public initiator;

    /// @notice Timestamp when `initiateRecovery` was called
    uint256 public startTime;

    /// @notice Whether recovery threshold has been reached
    bool public recovered;

    /// @dev Minimum shard approvals required
    uint256 public constant REQUIRED_APPROVALS = 4;

    /// @notice List of shard holder addresses
    address[] public shardHolders;

    /// @notice Mapping of approved shard holders
    mapping(address => bool) public isShardHolder;

    /// @notice Tracks whether a shard holder has approved recovery
    mapping(address => bool) public hasApproved;

    /// @notice Addresses that have approved recovery
    address[] public approvals;

    /// ---------------------------------------------------------------------
    /// Events
    /// ---------------------------------------------------------------------

    /// @notice Emitted when a recovery is started
    event RecoveryInitiated(address indexed by, uint256 at);

    /// @notice Emitted when a shard holder approves
    event ShardApproved(address indexed by);

    /// @notice Emitted when recovery threshold is met
    event RecoveryCompleted(address indexed to);

    /// ---------------------------------------------------------------------
    /// Modifiers
    /// ---------------------------------------------------------------------

    /// @dev Restricts functions to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// ---------------------------------------------------------------------
    /// Constructor
    /// ---------------------------------------------------------------------

    /// @param holders Seven shard holder addresses
    constructor(address[] memory holders) {
        require(holders.length == 7, "Must have 7 shards");

        owner = msg.sender;
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            shardHolders.push(holder);
            isShardHolder[holder] = true;
        }
    }

    /// ---------------------------------------------------------------------
    /// External functions
    /// ---------------------------------------------------------------------

    /// @notice Begin the recovery process
    function initiateRecovery() external {
        require(!recovered, "Already recovered");
        initiator = msg.sender;
        startTime = block.timestamp;
        recovered = false;

        emit RecoveryInitiated(msg.sender, block.timestamp);
    }

    /// @notice Approve a recovery if sender is a shard holder
    function approveRecovery() external {
        require(isShardHolder[msg.sender], "Not a shard holder");
        require(!hasApproved[msg.sender], "Already approved");
        require(!recovered, "Already recovered");

        hasApproved[msg.sender] = true;
        approvals.push(msg.sender);

        emit ShardApproved(msg.sender);
    }

    /// @notice Finalize the recovery once enough approvals have been collected
    function maybeRestoreVault() external {
        require(!recovered, "Vault already restored");
        require(approvals.length >= REQUIRED_APPROVALS, "Not enough approvals");

        recovered = true;

        emit RecoveryCompleted(initiator);
    }

    /// ---------------------------------------------------------------------
    /// View helpers
    /// ---------------------------------------------------------------------

    function getInitiator() external view returns (address) {
        return initiator;
    }

    function getStartTime() external view returns (uint256) {
        return startTime;
    }

    function isRecovered() external view returns (bool) {
        return recovered;
    }

    function getApprovals() external view returns (address[] memory) {
        return approvals;
    }
}
