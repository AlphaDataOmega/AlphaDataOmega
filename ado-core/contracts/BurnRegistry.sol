// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BurnRegistry
/// @notice Tracks all post-level TRN burns, used for eligibility, moderation, and BRN lifecycle enforcement.

contract BurnRegistry {
    event BurnRecorded(address indexed user, bytes32 indexed postHash, uint256 amount, uint256 timestamp);

    struct BurnEvent {
        uint256 amount;
        uint256 timestamp;
    }

    // Burn history per user → per post
    mapping(address => mapping(bytes32 => BurnEvent[])) public burnHistory;

    // Aggregate burns per user
    mapping(address => uint256) public totalBurned;

    /// @notice Called when a user burns TRN on a post (e.g. via downvote or retrn)
    function recordBurn(address user, bytes32 postHash, uint256 amount) external {
        burnHistory[user][postHash].push(BurnEvent({
            amount: amount,
            timestamp: block.timestamp
        }));

        totalBurned[user] += amount;
        emit BurnRecorded(user, postHash, amount, block.timestamp);
    }

    /// @notice Get total number of burns a user has made on a post
    function getBurnCount(address user, bytes32 postHash) external view returns (uint256) {
        return burnHistory[user][postHash].length;
    }

    /// @notice Get full burn record for a user/post (external fetch)
    function getBurnEvents(address user, bytes32 postHash) external view returns (BurnEvent[] memory) {
        return burnHistory[user][postHash];
    }

    /// @notice Get total TRN burned by user across all time
    function getTotalBurned(address user) external view returns (uint256) {
        return totalBurned[user];
    }
}
