// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
    function getAvailableTRN(address user) external view returns (uint256);
    function getTotalEarned(address user) external view returns (uint256);
    function getTotalSpent(address user) external view returns (uint256);
}

interface IFruitBalanceTracker {
    function getAvailableFruit(address user) external view returns (uint256);
    function getUserFruitStats(address user) external view returns (
        uint256 fruitBalance,
        uint256 fruitEarned,
        uint256 fruitSpent,
        uint256 nextFruitReset,
        bool isBlocked
    );
    function isUserBlocked(address user) external view returns (bool);
    function canPerformAction(address user, uint256 amount) external view returns (bool);
    function getGlobalFruitStats() external view returns (
        uint256 totalEarned,
        uint256 totalSpent,
        uint256 netFruit,
        uint256 lastReset
    );
    function getFruitUtilization() external view returns (uint256);
    function needsIntervention() external view returns (bool);
    function getFruitDeficit(address user) external view returns (uint256);
    function hasFruitDeficit(address user) external view returns (bool);
    function getRecommendedFruitLimit(address user) external view returns (uint256);
}

interface IAIBotVerifier {
    function isUserFlagged(address user) external view returns (bool);
    function isUserVerified(address user) external view returns (bool);
    function getUserVerificationStatus(address user) external view returns (
        bool flagged,
        bool verified,
        uint256 activityScore,
        uint256 suspiciousActions,
        uint256 lastVerificationTime
    );
    function calculateRiskScore(address user) external view returns (uint256);
    function getUserActivityScore(address user) external view returns (uint256);
    function getUserSuspiciousActions(address user) external view returns (uint256);
    function getGlobalBotStats() external view returns (
        uint256 totalFlagged,
        uint256 totalVerified,
        uint256 totalSuspicious,
        uint256 detectionRate
    );
    function getRecommendedActions(address user) external view returns (string[] memory);
    function needsIntervention() external view returns (bool);
}

interface IMintThrottleController {
    function getUserDebt(address user) external view returns (uint256);
    function getBurnPressure() external view returns (uint256);
    function getSystemHealth() external view returns (
        uint256 totalSystemDebt,
        uint256 currentBurnPressure,
        uint256 dailyMintUtilization,
        bool isHealthy
    );
    function getDailyMintStats() external view returns (
        uint256 limit,
        uint256 minted,
        uint256 remaining,
        uint256 nextReset
    );
    function hasDebt(address user) external view returns (bool);
    function getDebtToMintRatio() external view returns (uint256);
    function needsIntervention() external view returns (bool);
    function getRecommendedActions() external view returns (string[] memory);
}

/// @title TRNUsageOracleViewAdapter
/// @notice Provides a unified view adapter for TRN usage oracle and related systems
/// @dev Aggregates data from multiple contracts for efficient frontend consumption
contract TRNUsageOracleViewAdapter is Ownable {
    ITRNUsageOracle public immutable trnOracle;
    IFruitBalanceTracker public immutable fruitTracker;
    IAIBotVerifier public immutable botVerifier;
    IMintThrottleController public immutable mintThrottle;
    
    mapping(address => bool) public authorizedReaders;
    
    event ReaderAuthorized(address indexed reader);
    event ReaderRevoked(address indexed reader);

    constructor(
        address _trnOracle,
        address _fruitTracker,
        address _botVerifier,
        address _mintThrottle
    ) Ownable() {
        trnOracle = ITRNUsageOracle(_trnOracle);
        fruitTracker = IFruitBalanceTracker(_fruitTracker);
        botVerifier = IAIBotVerifier(_botVerifier);
        mintThrottle = IMintThrottleController(_mintThrottle);
    }

    modifier onlyAuthorizedReader() {
        require(authorizedReaders[msg.sender] || msg.sender == owner(), "Not authorized to read");
        _;
    }

    /// @notice Authorize a contract to read user data
    function authorizeReader(address reader) external onlyOwner {
        authorizedReaders[reader] = true;
        emit ReaderAuthorized(reader);
    }

    /// @notice Revoke reader authorization
    function revokeReader(address reader) external onlyOwner {
        authorizedReaders[reader] = false;
        emit ReaderRevoked(reader);
    }

    /// @notice Get user's TRN state (chain memory - finalized balances)
    function getUserTRNState(address user) external view onlyAuthorizedReader returns (
        uint256 availableTRN,
        uint256 totalEarned,
        uint256 totalSpent
    ) {
        availableTRN = trnOracle.getAvailableTRN(user);
        totalEarned = trnOracle.getTotalEarned(user);
        totalSpent = trnOracle.getTotalSpent(user);
    }

    /// @notice Get user's fruit state (indexer memory - real-time pending)
    function getUserFruitState(address user) external view onlyAuthorizedReader returns (
        uint256 fruitBalance,
        uint256 fruitEarned,
        uint256 fruitSpent,
        uint256 nextFruitReset,
        bool isBlocked
    ) {
        (fruitBalance, fruitEarned, fruitSpent, nextFruitReset, isBlocked) = fruitTracker.getUserFruitStats(user);
    }

    /// @notice Get user's debt and burn pressure (system-wide state)
    function getUserDebtState(address user) external view onlyAuthorizedReader returns (
        uint256 userDebt,
        uint256 burnPressure
    ) {
        userDebt = mintThrottle.getUserDebt(user);
        burnPressure = mintThrottle.getBurnPressure();
    }

    /// @notice Get user's bot verification status (AI memory)
    function getUserBotState(address user) external view onlyAuthorizedReader returns (
        bool isFlagged,
        bool isVerified,
        uint256 activityScore,
        uint256 suspiciousActions
    ) {
        (bool flagged, bool verified, uint256 activityScore, uint256 suspiciousActions, ) = botVerifier.getUserVerificationStatus(user);
        isFlagged = flagged;
        isVerified = verified;
    }

    /// @notice Get user's available TRN balance
    function getAvailableTRN(address user) external view onlyAuthorizedReader returns (uint256) {
        return trnOracle.getAvailableTRN(user);
    }

    /// @notice Get user's total earnings
    function getTotalEarned(address user) external view onlyAuthorizedReader returns (uint256) {
        return trnOracle.getTotalEarned(user);
    }

    /// @notice Get user's total spending
    function getTotalSpent(address user) external view onlyAuthorizedReader returns (uint256) {
        return trnOracle.getTotalSpent(user);
    }

    /// @notice Get user's fruit balance
    function getFruitBalance(address user) external view onlyAuthorizedReader returns (uint256) {
        return fruitTracker.getAvailableFruit(user);
    }

    /// @notice Get user's debt amount
    function getUserDebt(address user) external view onlyAuthorizedReader returns (uint256) {
        return mintThrottle.getUserDebt(user);
    }

    /// @notice Check if user can perform actions
    function canPerformAction(address user, uint256 requiredAmount) external view onlyAuthorizedReader returns (bool) {
        // Check if user is blocked by fruit tracker
        if (fruitTracker.isUserBlocked(user)) return false;
        
        // Check if user is flagged by bot verifier
        if (botVerifier.isUserFlagged(user)) return false;
        
        // Check if user has sufficient fruit balance
        if (!fruitTracker.canPerformAction(user, requiredAmount)) return false;
        
        // Check if user has sufficient TRN balance
        if (trnOracle.getAvailableTRN(user) < requiredAmount) return false;
        
        return true;
    }

    /// @notice Get user's verification status
    function getUserVerificationStatus(address user) external view onlyAuthorizedReader returns (
        bool flagged,
        bool verified,
        uint256 activityScore,
        uint256 suspiciousActions,
        uint256 lastVerificationTime
    ) {
        (flagged, verified, activityScore, suspiciousActions, lastVerificationTime) = botVerifier.getUserVerificationStatus(user);
    }

    /// @notice Get user's risk score
    function getUserRiskScore(address user) external view onlyAuthorizedReader returns (uint256) {
        return botVerifier.calculateRiskScore(user);
    }

    /// @notice Get system health metrics
    function getSystemHealth() external view onlyAuthorizedReader returns (
        uint256 totalSystemDebt,
        uint256 currentBurnPressure,
        uint256 dailyMintUtilization,
        bool isHealthy,
        uint256 totalFlaggedUsers,
        uint256 totalVerifiedUsers,
        uint256 detectionRate
    ) {
        (totalSystemDebt, currentBurnPressure, dailyMintUtilization, isHealthy) = mintThrottle.getSystemHealth();
        (totalFlaggedUsers, totalVerifiedUsers, , detectionRate) = botVerifier.getGlobalBotStats();
    }

    /// @notice Get daily mint statistics
    function getDailyMintStats() external view onlyAuthorizedReader returns (
        uint256 limit,
        uint256 minted,
        uint256 remaining,
        uint256 nextReset
    ) {
        return mintThrottle.getDailyMintStats();
    }

    /// @notice Get global fruit statistics
    function getGlobalFruitStats() external view onlyAuthorizedReader returns (
        uint256 totalEarned,
        uint256 totalSpent,
        uint256 netFruit,
        uint256 lastReset
    ) {
        return fruitTracker.getGlobalFruitStats();
    }

    /// @notice Check if user has debt
    function hasDebt(address user) external view onlyAuthorizedReader returns (bool) {
        return mintThrottle.hasDebt(user);
    }

    /// @notice Check if user is blocked
    function isUserBlocked(address user) external view onlyAuthorizedReader returns (bool) {
        return fruitTracker.isUserBlocked(user);
    }

    /// @notice Check if user is flagged
    function isUserFlagged(address user) external view onlyAuthorizedReader returns (bool) {
        return botVerifier.isUserFlagged(user);
    }

    /// @notice Check if user is verified
    function isUserVerified(address user) external view onlyAuthorizedReader returns (bool) {
        return botVerifier.isUserVerified(user);
    }

    /// @notice Get user's fruit deficit
    function getFruitDeficit(address user) external view onlyAuthorizedReader returns (uint256) {
        return fruitTracker.getFruitDeficit(user);
    }

    /// @notice Check if user has fruit deficit
    function hasFruitDeficit(address user) external view onlyAuthorizedReader returns (bool) {
        return fruitTracker.hasFruitDeficit(user);
    }

    /// @notice Get recommended fruit limit for user
    function getRecommendedFruitLimit(address user) external view onlyAuthorizedReader returns (uint256) {
        return fruitTracker.getRecommendedFruitLimit(user);
    }

    /// @notice Get debt-to-mint ratio
    function getDebtToMintRatio() external view onlyAuthorizedReader returns (uint256) {
        return mintThrottle.getDebtToMintRatio();
    }

    /// @notice Check if system needs intervention
    function needsIntervention() external view onlyAuthorizedReader returns (bool) {
        return mintThrottle.needsIntervention() || botVerifier.needsIntervention() || fruitTracker.needsIntervention();
    }

    /// @notice Get recommended actions for system health
    function getSystemRecommendedActions() external view onlyAuthorizedReader returns (string[] memory) {
        return mintThrottle.getRecommendedActions();
    }

    /// @notice Get recommended actions for specific user
    function getUserRecommendedActions(address user) external view onlyAuthorizedReader returns (string[] memory) {
        return botVerifier.getRecommendedActions(user);
    }

    /// @notice Get user's activity score
    function getUserActivityScore(address user) external view onlyAuthorizedReader returns (uint256) {
        return botVerifier.getUserActivityScore(user);
    }

    /// @notice Get user's suspicious action count
    function getUserSuspiciousActions(address user) external view onlyAuthorizedReader returns (uint256) {
        return botVerifier.getUserSuspiciousActions(user);
    }

    /// @notice Get current burn pressure
    function getBurnPressure() external view onlyAuthorizedReader returns (uint256) {
        return mintThrottle.getBurnPressure();
    }

    /// @notice Get fruit utilization percentage
    function getFruitUtilization() external view onlyAuthorizedReader returns (uint256) {
        return fruitTracker.getFruitUtilization();
    }

    /// @notice Get comprehensive user summary for UI
    function getUserSummary(address user) external view onlyAuthorizedReader returns (
        uint256 availableTRN,
        uint256 fruitBalance,
        uint256 userDebt,
        bool canPerformActions,
        bool isBlocked,
        bool isFlagged,
        uint256 riskScore,
        uint256 nextReset
    ) {
        availableTRN = trnOracle.getAvailableTRN(user);
        fruitBalance = fruitTracker.getAvailableFruit(user);
        userDebt = mintThrottle.getUserDebt(user);
        canPerformActions = this.canPerformAction(user, 1); // Check if can perform minimal action
        isBlocked = fruitTracker.isUserBlocked(user);
        isFlagged = botVerifier.isUserFlagged(user);
        riskScore = botVerifier.calculateRiskScore(user);
        
        (,,, nextReset, ) = fruitTracker.getUserFruitStats(user);
    }
} 