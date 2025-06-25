// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RecoveryOracle
/// @notice Tracks shard approvals for vault recovery.
contract RecoveryOracle {
    address public initiator;
    uint256 public startTime;
    bool public recovered;

    mapping(address => bool) public shardHolders;
    mapping(address => bool) public hasApprovedMap;
    address[] public approvals;

    constructor(address[] memory holders) {
        initiator = msg.sender;
        startTime = block.timestamp;
        for (uint256 i = 0; i < holders.length; i++) {
            shardHolders[holders[i]] = true;
        }
    }

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

    function isShardHolder(address addr) external view returns (bool) {
        return shardHolders[addr];
    }

    function hasApproved(address addr) external view returns (bool) {
        return hasApprovedMap[addr];
    }

    function approveRecovery() external {
        require(shardHolders[msg.sender], "not shard holder");
        require(!hasApprovedMap[msg.sender], "already approved");
        hasApprovedMap[msg.sender] = true;
        approvals.push(msg.sender);
        if (approvals.length >= 4) {
            recovered = true;
        }
    }
}
