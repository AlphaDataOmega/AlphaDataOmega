// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VaultRecovery
/// @notice On-chain gatekeeper for vault recovery using shard keys
contract VaultRecovery {
    address public owner;
    uint256 public constant REQUIRED_SHARDS = 4;

    struct RecoveryRequest {
        string[] shards;
        uint256 timestamp;
        bool completed;
    }

    mapping(address => RecoveryRequest) public recoveryRequests;

    event RecoverySubmitted(address indexed user, uint256 timestamp);
    event VaultRecovered(address indexed user);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Submit shard keys for recovery
    /// @param shards Array of shard keys
    function submitRecovery(string[] memory shards) external {
        require(shards.length >= REQUIRED_SHARDS, "Not enough shard keys");
        require(!recoveryRequests[msg.sender].completed, "Already recovered");

        recoveryRequests[msg.sender] = RecoveryRequest({
            shards: shards,
            timestamp: block.timestamp,
            completed: false
        });

        emit RecoverySubmitted(msg.sender, block.timestamp);
    }

    /// @notice Finalize recovery after admin validation
    /// @param user Address whose vault is being recovered
    function finalizeRecovery(address user) external {
        require(msg.sender == owner, "Only admin can finalize");
        require(!recoveryRequests[user].completed, "Already completed");

        // TODO: integrate with TRNUsageOracle or access control logic
        recoveryRequests[user].completed = true;

        emit VaultRecovered(user);
    }

    /// @notice Returns recovery completion status
    /// @param user Address to query
    function getRecoveryStatus(address user) external view returns (bool) {
        return recoveryRequests[user].completed;
    }

    /// @notice Returns number of shard keys submitted
    /// @param user Address to query
    function getShardCount(address user) external view returns (uint256) {
        return recoveryRequests[user].shards.length;
    }
}
