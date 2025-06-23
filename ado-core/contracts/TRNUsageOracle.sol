// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TRNUsageOracle
/// @notice Central accounting hub for all TRN transactions. Tracks debt, earnings, burns, and enforces flow rules.
/// @dev All TRN transfers and burns must route through this contract.

contract TRNUsageOracle {
    event TRNEarned(address indexed user, uint256 amount, bytes32 indexed sourceHash);
    event TRNBurned(address indexed user, uint256 amount, bytes32 indexed postHash);
    event TRNSpent(address indexed user, uint256 amount, string action);
    event TRNTransferred(address indexed from, address indexed to, uint256 amount);

    mapping(address => uint256) public earnedTRN;
    mapping(address => uint256) public spentTRN;
    mapping(address => uint256) public burnedTRN;
    mapping(address => uint256) public pendingDebt;

    // Optional trust score storage used for testing vault weighting
    mapping(address => mapping(bytes32 => uint256)) public trustScores;

    /// @notice Called when a user earns TRN (e.g. from a view or retrn)
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external {
        earnedTRN[user] += amount;
        emit TRNEarned(user, amount, sourceHash);
    }

    /// @notice Called when a user spends TRN (e.g. vote, pin, boost)
    function reportSpend(address user, uint256 amount, string calldata action) external {
        spentTRN[user] += amount;
        emit TRNSpent(user, amount, action);
    }

    /// @notice Called when a user burns TRN (e.g. bless-to-burn, retrn, moderation)
    function reportBurn(address user, uint256 amount, bytes32 postHash) external {
        burnedTRN[user] += amount;
        emit TRNBurned(user, amount, postHash);
    }

    /// @notice Reports pending debt a user must resolve before further actions
    function increaseDebt(address user, uint256 amount) external {
        pendingDebt[user] += amount;
    }

    /// @notice Clears settled debt for a user
    function settleDebt(address user, uint256 amount) external {
        require(pendingDebt[user] >= amount, "Over-settlement");
        pendingDebt[user] -= amount;
    }

    /// @notice Logs a peer-to-peer transfer of TRN
    /// @dev Does not move tokens; only updates accounting state
    function reportTransfer(address from, address to, uint256 amount) external {
        require(getAvailableTRN(from) >= amount, "Insufficient TRN");
        spentTRN[from] += amount;
        earnedTRN[to] += amount;
        emit TRNTransferred(from, to, amount);
    }

    /// @notice Returns available balance = earned - spent - burned - pendingDebt
    function getAvailableTRN(address user) public view returns (uint256) {
        uint256 total = earnedTRN[user];
        uint256 used = spentTRN[user] + burnedTRN[user] + pendingDebt[user];
        return total > used ? total - used : 0;
    }

    /// @notice Set a trust score for a contributor in a specific category
    function setTrustScore(address contributor, string calldata category, uint256 score) external {
        trustScores[contributor][keccak256(bytes(category))] = score;
    }

    /// @notice Returns the trust score for a contributor
    function getTrustScore(address contributor, string memory category) external view returns (uint256) {
        return trustScores[contributor][keccak256(bytes(category))];
    }

    /// @notice Records earnings coming from off-chain calculations (e.g., vaults)
    function notifyEarnings(address contributor, uint256 amount) external {
        earnedTRN[contributor] += amount;
        emit TRNEarned(contributor, amount, keccak256("vault-distribution"));
    }
}
