// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
}

/// @title FruitBalanceTracker
/// @notice Tracks daily fruit debits and credits per user for Merkle reconciliation
/// @dev Manages the fruit balance system where fruit = pre-authorized usage credit
contract FruitBalanceTracker is Ownable {
    ITRNUsageOracle public immutable trnOracle;
    
    uint256 public constant FRUIT_RESET_TIME = 0; // 00:00 UTC
    uint256 public constant MAX_FRUIT_PER_DAY = 10000 * 10**18; // 10K TRN fruit per day
    
    mapping(address => uint256) public userFruitBalance;
    mapping(address => uint256) public userFruitEarned;
    mapping(address => uint256) public userFruitSpent;
    mapping(address => uint256) public lastFruitReset;
    mapping(address => bool) public userBlocked;
    
    uint256 public totalFruitEarned;
    uint256 public totalFruitSpent;
    uint256 public lastGlobalReset;
    
    event FruitEarned(address indexed user, uint256 amount, bytes32 indexed source);
    event FruitSpent(address indexed user, uint256 amount, string action);
    event FruitReset(address indexed user, uint256 newBalance);
    event UserBlocked(address indexed user, string reason);
    event UserUnblocked(address indexed user);

    constructor(address _trnOracle) Ownable() {
        trnOracle = ITRNUsageOracle(_trnOracle);
        lastGlobalReset = block.timestamp;
    }

    /// @notice Earn fruit (pre-authorized usage credit)
    function earnFruit(address user, uint256 amount, bytes32 source) external {
        require(amount > 0, "Amount must be positive");
        require(!userBlocked[user], "User is blocked");
        
        // Reset fruit balance if it's a new day
        resetUserFruitIfNeeded(user);
        
        userFruitBalance[user] += amount;
        userFruitEarned[user] += amount;
        totalFruitEarned += amount;
        
        emit FruitEarned(user, amount, source);
    }

    /// @notice Spend fruit (use pre-authorized credit)
    function spendFruit(address user, uint256 amount, string calldata action) external {
        require(amount > 0, "Amount must be positive");
        require(!userBlocked[user], "User is blocked");
        
        // Reset fruit balance if it's a new day
        resetUserFruitIfNeeded(user);
        
        require(userFruitBalance[user] >= amount, "Insufficient fruit balance");
        
        userFruitBalance[user] -= amount;
        userFruitSpent[user] += amount;
        totalFruitSpent += amount;
        
        emit FruitSpent(user, amount, action);
    }

    /// @notice Check if user can perform an action
    function canPerformAction(address user, uint256 requiredAmount) external view returns (bool) {
        if (userBlocked[user]) return false;
        
        uint256 availableFruit = getAvailableFruit(user);
        return availableFruit >= requiredAmount;
    }

    /// @notice Get available fruit balance for user
    function getAvailableFruit(address user) public view returns (uint256) {
        // Check if we need to reset fruit for this user
        if (shouldResetFruit(user)) {
            return 0; // Fruit resets daily
        }
        return userFruitBalance[user];
    }

    /// @notice Reset user's fruit balance if it's a new day
    function resetUserFruitIfNeeded(address user) internal {
        if (shouldResetFruit(user)) {
            userFruitBalance[user] = 0;
            userFruitEarned[user] = 0;
            userFruitSpent[user] = 0;
            lastFruitReset[user] = block.timestamp;
            
            emit FruitReset(user, 0);
        }
    }

    /// @notice Check if user's fruit should be reset
    function shouldResetFruit(address user) public view returns (bool) {
        uint256 lastReset = lastFruitReset[user];
        if (lastReset == 0) return false;
        
        // Check if 24 hours have passed since last reset
        return block.timestamp >= lastReset + 1 days;
    }

    /// @notice Get user's fruit statistics
    function getUserFruitStats(address user) external view returns (
        uint256 balance,
        uint256 earned,
        uint256 spent,
        uint256 nextReset,
        bool blocked
    ) {
        balance = getAvailableFruit(user);
        earned = userFruitEarned[user];
        spent = userFruitSpent[user];
        nextReset = lastFruitReset[user] + 1 days;
        blocked = userBlocked[user];
    }

    /// @notice Block user from earning/spending fruit
    function blockUser(address user, string calldata reason) external onlyOwner {
        userBlocked[user] = true;
        emit UserBlocked(user, reason);
    }

    /// @notice Unblock user
    function unblockUser(address user) external onlyOwner {
        userBlocked[user] = false;
        emit UserUnblocked(user);
    }

    /// @notice Check if user is blocked
    function isUserBlocked(address user) external view returns (bool) {
        return userBlocked[user];
    }

    /// @notice Get global fruit statistics
    function getGlobalFruitStats() external view returns (
        uint256 totalEarned,
        uint256 totalSpent,
        uint256 netFruit,
        uint256 lastReset
    ) {
        totalEarned = totalFruitEarned;
        totalSpent = totalFruitSpent;
        netFruit = totalEarned > totalSpent ? totalEarned - totalSpent : 0;
        lastReset = lastGlobalReset;
    }

    /// @notice Force reset all fruit balances (emergency function)
    function forceGlobalReset() external onlyOwner {
        totalFruitEarned = 0;
        totalFruitSpent = 0;
        lastGlobalReset = block.timestamp;
    }

    /// @notice Reset specific user's fruit (emergency function)
    function forceUserReset(address user) external onlyOwner {
        userFruitBalance[user] = 0;
        userFruitEarned[user] = 0;
        userFruitSpent[user] = 0;
        lastFruitReset[user] = block.timestamp;
        
        emit FruitReset(user, 0);
    }

    /// @notice Get fruit utilization percentage
    function getFruitUtilization() external view returns (uint256) {
        if (totalFruitEarned == 0) return 0;
        return (totalFruitSpent * 100) / totalFruitEarned;
    }

    /// @notice Check if system needs intervention
    function needsIntervention() external view returns (bool) {
        uint256 utilization = this.getFruitUtilization();
        return utilization > 90; // If 90%+ of fruit is spent
    }

    /// @notice Get users with high fruit spending
    function getHighSpenders(uint256 threshold) external view returns (address[] memory) {
        // This would need to be implemented with a more sophisticated data structure
        // For now, return empty array
        return new address[](0);
    }

    /// @notice Calculate fruit deficit for user
    function getFruitDeficit(address user) external view returns (uint256) {
        if (userFruitEarned[user] >= userFruitSpent[user]) {
            return 0;
        }
        return userFruitSpent[user] - userFruitEarned[user];
    }

    /// @notice Check if user has fruit deficit
    function hasFruitDeficit(address user) external view returns (bool) {
        return userFruitSpent[user] > userFruitEarned[user];
    }

    /// @notice Get recommended fruit limit for user
    function getRecommendedFruitLimit(address user) external view returns (uint256) {
        uint256 deficit = this.getFruitDeficit(user);
        if (deficit > 0) {
            return MAX_FRUIT_PER_DAY / 2; // Reduce limit for users with deficit
        }
        return MAX_FRUIT_PER_DAY;
    }

    /// @notice Emergency function to adjust fruit balance
    function emergencyFruitAdjustment(address user, int256 adjustment) external onlyOwner {
        if (adjustment > 0) {
            userFruitBalance[user] += uint256(adjustment);
            userFruitEarned[user] += uint256(adjustment);
            totalFruitEarned += uint256(adjustment);
        } else {
            uint256 absAdjustment = uint256(-adjustment);
            if (userFruitBalance[user] >= absAdjustment) {
                userFruitBalance[user] -= absAdjustment;
                userFruitSpent[user] += absAdjustment;
                totalFruitSpent += absAdjustment;
            }
        }
    }
} 