// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./TRNUsageOracle.sol";
import "./FruitBalanceTracker.sol";
import "./DailyVaultSplitter.sol";

/// @title TRNMerkleBatcher
/// @notice Runs daily Merkle diff, distributes rewards, handles vault payouts
/// @dev Manages daily reconciliation and reward distribution
contract TRNMerkleBatcher is Ownable {
    TRNUsageOracle public immutable trnOracle;
    FruitBalanceTracker public immutable fruitTracker;
    DailyVaultSplitter public immutable vaultSplitter;
    
    uint256 public constant DAILY_RESET_TIME = 0; // 00:00 UTC
    uint256 public constant MAX_DAILY_DISTRIBUTION = 1000000 * 10**18; // 1M TRN per day
    
    mapping(uint256 => bytes32) public dailyMerkleRoots; // day => merkle root
    mapping(uint256 => uint256) public dailyDistributions; // day => total distributed
    mapping(address => mapping(uint256 => bool)) public userClaims; // user => day => claimed
    
    uint256 public lastBatchDay;
    uint256 public lastBatchTime;
    
    event DailyBatchProcessed(uint256 indexed day, bytes32 merkleRoot, uint256 totalDistributed);
    event UserClaimed(address indexed user, uint256 indexed day, uint256 amount);
    event MerkleRootUpdated(uint256 indexed day, bytes32 oldRoot, bytes32 newRoot);

    constructor(
        address _trnOracle,
        address _fruitTracker,
        address _vaultSplitter
    ) Ownable() {
        trnOracle = TRNUsageOracle(_trnOracle);
        fruitTracker = FruitBalanceTracker(_fruitTracker);
        vaultSplitter = DailyVaultSplitter(_vaultSplitter);
        lastBatchDay = getCurrentDay();
        lastBatchTime = block.timestamp;
    }

    /// @notice Get current day (days since epoch)
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    /// @notice Check if daily batch needs to be processed
    function needsDailyBatch() external view returns (bool) {
        uint256 currentDay = getCurrentDay();
        return currentDay > lastBatchDay;
    }

    /// @notice Process daily batch and update Merkle root
    function processDailyBatch(bytes32 merkleRoot, uint256 totalDistributed) external onlyOwner {
        uint256 currentDay = getCurrentDay();
        require(currentDay > lastBatchDay, "Batch already processed for today");
        require(totalDistributed <= MAX_DAILY_DISTRIBUTION, "Distribution exceeds daily limit");
        
        // Update Merkle root for the day
        bytes32 oldRoot = dailyMerkleRoots[lastBatchDay];
        dailyMerkleRoots[lastBatchDay] = merkleRoot;
        dailyDistributions[lastBatchDay] = totalDistributed;
        
        // Reset fruit balances for all users
        // Note: This would need to be implemented with a more sophisticated approach
        // For now, we'll emit an event to track the reset
        
        lastBatchDay = currentDay;
        lastBatchTime = block.timestamp;
        
        emit DailyBatchProcessed(lastBatchDay, merkleRoot, totalDistributed);
        emit MerkleRootUpdated(lastBatchDay, oldRoot, merkleRoot);
    }

    /// @notice Claim rewards for a specific day
    function claimRewards(
        uint256 day,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(day < getCurrentDay(), "Cannot claim for current or future day");
        require(!userClaims[msg.sender][day], "Already claimed for this day");
        require(dailyMerkleRoots[day] != bytes32(0), "Merkle root not set for this day");
        
        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, dailyMerkleRoots[day], leaf), "Invalid Merkle proof");
        
        // Mark as claimed
        userClaims[msg.sender][day] = true;
        
        // Distribute rewards
        trnOracle.reportEarning(msg.sender, amount, keccak256(abi.encodePacked("merkle-claim", day)));
        
        emit UserClaimed(msg.sender, day, amount);
    }

    /// @notice Check if user has claimed for a specific day
    function hasClaimed(address user, uint256 day) external view returns (bool) {
        return userClaims[user][day];
    }

    /// @notice Get Merkle root for a specific day
    function getMerkleRoot(uint256 day) external view returns (bytes32) {
        return dailyMerkleRoots[day];
    }

    /// @notice Get total distribution for a specific day
    function getDailyDistribution(uint256 day) external view returns (uint256) {
        return dailyDistributions[day];
    }

    /// @notice Get last batch information
    function getLastBatchInfo() external view returns (
        uint256 day,
        uint256 timestamp,
        bytes32 merkleRoot,
        uint256 totalDistributed
    ) {
        day = lastBatchDay;
        timestamp = lastBatchTime;
        merkleRoot = dailyMerkleRoots[day];
        totalDistributed = dailyDistributions[day];
    }

    /// @notice Calculate user's claimable amount for a day
    function calculateClaimableAmount(
        address user,
        uint256 day,
        bytes32[] calldata merkleProof
    ) external view returns (uint256) {
        if (userClaims[user][day] || dailyMerkleRoots[day] == bytes32(0)) {
            return 0;
        }
        
        // This would need to be implemented with actual user data
        // For now, return 0 as placeholder
        return 0;
    }

    /// @notice Get user's claim history
    function getUserClaimHistory(address user, uint256 startDay, uint256 endDay) external view returns (
        uint256[] memory claimDays,
        uint256[] memory amounts,
        bool[] memory claimed
    ) {
        uint256 dayCount = endDay - startDay + 1;
        claimDays = new uint256[](dayCount);
        amounts = new uint256[](dayCount);
        claimed = new bool[](dayCount);
        
        for (uint256 i = 0; i < dayCount; i++) {
            uint256 day = startDay + i;
            claimDays[i] = day;
            claimed[i] = userClaims[user][day];
            amounts[i] = 0; // Would need to be calculated from actual data
        }
    }

    /// @notice Emergency function to update Merkle root
    function emergencyUpdateMerkleRoot(uint256 day, bytes32 newRoot) external onlyOwner {
        require(day <= lastBatchDay, "Cannot update future day");
        
        bytes32 oldRoot = dailyMerkleRoots[day];
        dailyMerkleRoots[day] = newRoot;
        
        emit MerkleRootUpdated(day, oldRoot, newRoot);
    }

    /// @notice Force reset user claims for a day (emergency function)
    function emergencyResetUserClaims(address user, uint256 day) external onlyOwner {
        userClaims[user][day] = false;
    }

    /// @notice Get batch statistics
    function getBatchStats() external view returns (
        uint256 totalDaysProcessed,
        uint256 totalDistributed,
        uint256 averageDailyDistribution,
        uint256 lastProcessedDay
    ) {
        totalDaysProcessed = lastBatchDay;
        lastProcessedDay = lastBatchDay;
        
        uint256 totalDist = 0;
        for (uint256 day = 1; day <= lastBatchDay; day++) {
            totalDist += dailyDistributions[day];
        }
        totalDistributed = totalDist;
        
        if (lastBatchDay > 0) {
            averageDailyDistribution = totalDistributed / lastBatchDay;
        }
    }

    /// @notice Check if system is healthy
    function isSystemHealthy() external view returns (bool) {
        uint256 currentDay = getCurrentDay();
        
        // Check if we're not too far behind on processing
        if (currentDay - lastBatchDay > 7) {
            return false;
        }
        
        // Check if daily distributions are reasonable
        uint256 recentDistribution = dailyDistributions[lastBatchDay];
        if (recentDistribution > MAX_DAILY_DISTRIBUTION * 9 / 10) {
            return false;
        }
        
        return true;
    }

    /// @notice Get recommended actions for system health
    function getRecommendedActions() external view returns (string[] memory) {
        string[] memory actions = new string[](3);
        uint256 actionCount = 0;
        
        uint256 currentDay = getCurrentDay();
        if (currentDay - lastBatchDay > 3) {
            actions[actionCount] = "Process pending daily batches";
            actionCount++;
        }
        
        uint256 recentDistribution = dailyDistributions[lastBatchDay];
        if (recentDistribution > MAX_DAILY_DISTRIBUTION * 8 / 10) {
            actions[actionCount] = "Review daily distribution limits";
            actionCount++;
        }
        
        if (!this.isSystemHealthy()) {
            actions[actionCount] = "Investigate system health issues";
            actionCount++;
        }
        
        return actions;
    }

    /// @notice Verify Merkle proof
    function verifyMerkleProof(
        address user,
        uint256 amount,
        uint256 day,
        bytes32[] calldata merkleProof
    ) external view returns (bool) {
        if (dailyMerkleRoots[day] == bytes32(0)) {
            return false;
        }
        
        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        return MerkleProof.verify(merkleProof, dailyMerkleRoots[day], leaf);
    }

    /// @notice Get next batch deadline
    function getNextBatchDeadline() external view returns (uint256) {
        uint256 currentDay = getCurrentDay();
        uint256 nextDay = currentDay + 1;
        return nextDay * 1 days;
    }

    /// @notice Check if batch is overdue
    function isBatchOverdue() external view returns (bool) {
        uint256 currentDay = getCurrentDay();
        return currentDay - lastBatchDay > 1;
    }
} 