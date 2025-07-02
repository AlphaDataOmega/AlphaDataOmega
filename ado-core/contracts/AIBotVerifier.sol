// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
}

/// @title AI Bot Verifier
/// @notice Detects AI-inflated engagement, fake accounts, and manipulation attempts
/// @dev Uses behavioral analysis and pattern recognition to identify bots
contract AIBotVerifier is Ownable {
    ITRNUsageOracle public immutable trnOracle;
    
    uint256 public constant SUSPICIOUS_ACTIVITY_THRESHOLD = 100; // Actions per hour
    uint256 public constant MASS_VIEW_THRESHOLD = 50; // Views per minute
    uint256 public constant BRN_MANIPULATION_THRESHOLD = 1000 * 10**18; // 1K BRN burn
    uint256 public constant VERIFICATION_COOLDOWN = 1 hours;
    
    mapping(address => uint256) public userActivityScore;
    mapping(address => uint256) public lastActivityTime;
    mapping(address => uint256) public suspiciousActions;
    mapping(address => bool) public flaggedUsers;
    mapping(address => bool) public verifiedUsers;
    mapping(address => uint256) public lastVerification;
    
    uint256 public totalFlaggedUsers;
    uint256 public totalVerifiedUsers;
    
    event UserFlagged(address indexed user, string reason, uint256 score);
    event UserVerified(address indexed user);
    event SuspiciousActivity(address indexed user, string activity, uint256 score);
    event ActivityReported(address indexed user, string activityType, uint256 score, uint256 totalScore);
    event BotDetected(address indexed user, string pattern);

    constructor(address _trnOracle) Ownable() {
        trnOracle = ITRNUsageOracle(_trnOracle);
    }

    /// @notice Report suspicious activity
    function reportActivity(address user, string calldata activityType, uint256 score) external {
        require(score > 0, "Score must be positive");
        
        userActivityScore[user] += score;
        lastActivityTime[user] = block.timestamp;
        
        emit ActivityReported(user, activityType, score, userActivityScore[user]);
        
        // Check if activity exceeds threshold
        if (userActivityScore[user] > SUSPICIOUS_ACTIVITY_THRESHOLD) {
            suspiciousActions[user]++;
            emit SuspiciousActivity(user, "high_activity", userActivityScore[user]);
            
            if (suspiciousActions[user] >= 2) {
                flagUser(user, "High activity pattern");
            }
        }
    }

    /// @notice Report mass view patterns
    function reportMassViews(address user, uint256 viewsPerMinute) external {
        require(viewsPerMinute > 0, "Views per minute must be positive");
        
        if (viewsPerMinute > MASS_VIEW_THRESHOLD) {
            suspiciousActions[user]++;
            emit SuspiciousActivity(user, "mass_views", viewsPerMinute);
            
            if (suspiciousActions[user] >= 2) {
                flagUser(user, "Mass view pattern");
            }
        }
    }

    /// @notice Report BRN manipulation attempts
    function reportBRNManipulation(address user, uint256 burnAmount) external {
        require(burnAmount > 0, "Burn amount must be positive");
        
        if (burnAmount > BRN_MANIPULATION_THRESHOLD) {
            suspiciousActions[user]++;
            emit SuspiciousActivity(user, "brn_manipulation", burnAmount);
            
            if (suspiciousActions[user] >= 2) {
                flagUser(user, "BRN manipulation");
            }
        }
    }

    /// @notice Flag user as suspicious
    function flagUser(address user, string memory reason) internal {
        if (!flaggedUsers[user]) {
            flaggedUsers[user] = true;
            totalFlaggedUsers++;
            emit UserFlagged(user, reason, userActivityScore[user]);
        }
    }

    /// @notice Verify user as legitimate
    function verifyUser(address user) external onlyOwner {
        require(flaggedUsers[user], "User not flagged");
        
        flaggedUsers[user] = false;
        verifiedUsers[user] = true;
        lastVerification[user] = block.timestamp;
        totalFlaggedUsers--;
        totalVerifiedUsers++;
        
        // Reset activity score
        userActivityScore[user] = 0;
        suspiciousActions[user] = 0;
        
        emit UserVerified(user);
    }

    /// @notice Check if user is flagged
    function isUserFlagged(address user) external view returns (bool) {
        return flaggedUsers[user];
    }

    /// @notice Check if user is verified
    function isUserVerified(address user) external view returns (bool) {
        return verifiedUsers[user];
    }

    /// @notice Get user's activity score
    function getUserActivityScore(address user) external view returns (uint256) {
        return userActivityScore[user];
    }

    /// @notice Get user's suspicious action count
    function getUserSuspiciousActions(address user) external view returns (uint256) {
        return suspiciousActions[user];
    }

    /// @notice Check if user can perform actions
    function canPerformAction(address user) external view returns (bool) {
        if (flaggedUsers[user]) return false;
        
        // Check if user needs re-verification
        if (verifiedUsers[user] && block.timestamp > lastVerification[user] + VERIFICATION_COOLDOWN) {
            return false;
        }
        
        return true;
    }

    /// @notice Get user's verification status
    function getUserVerificationStatus(address user) external view returns (
        bool flagged,
        bool verified,
        uint256 activityScore,
        uint256 suspiciousActions,
        uint256 lastVerificationTime
    ) {
        flagged = flaggedUsers[user];
        verified = verifiedUsers[user];
        activityScore = userActivityScore[user];
        suspiciousActions = this.getUserSuspiciousActions(user);
        lastVerificationTime = lastVerification[user];
    }

    /// @notice Get global bot detection statistics
    function getGlobalBotStats() external view returns (
        uint256 totalFlagged,
        uint256 totalVerified,
        uint256 totalSuspicious,
        uint256 detectionRate
    ) {
        totalFlagged = totalFlaggedUsers;
        totalVerified = totalVerifiedUsers;
        totalSuspicious = totalFlagged + totalVerified;
        
        if (totalSuspicious > 0) {
            detectionRate = (totalFlagged * 100) / totalSuspicious;
        }
    }

    /// @notice Emergency unflag user
    function emergencyUnflag(address user) external onlyOwner {
        if (flaggedUsers[user]) {
            flaggedUsers[user] = false;
            totalFlaggedUsers--;
        }
    }

    /// @notice Reset user's activity data
    function resetUserActivity(address user) external onlyOwner {
        userActivityScore[user] = 0;
        suspiciousActions[user] = 0;
        lastActivityTime[user] = 0;
    }

    /// @notice Update activity thresholds
    function updateThresholds(
        uint256 newActivityThreshold,
        uint256 newViewThreshold,
        uint256 newManipulationThreshold
    ) external onlyOwner {
        // Note: These are constants, so they would need to be implemented as state variables
        // For now, we'll emit an event to track threshold changes
        emit SuspiciousActivity(address(0), "threshold_update", newActivityThreshold);
    }

    /// @notice Get recommended actions for flagged user
    function getRecommendedActions(address user) external view returns (string[] memory) {
        string[] memory actions = new string[](3);
        uint256 actionCount = 0;
        
        if (userActivityScore[user] > SUSPICIOUS_ACTIVITY_THRESHOLD) {
            actions[actionCount] = "Reduce activity frequency";
            actionCount++;
        }
        
        if (suspiciousActions[user] >= 3) {
            actions[actionCount] = "Manual verification required";
            actionCount++;
        }
        
        if (flaggedUsers[user]) {
            actions[actionCount] = "Contact support for verification";
            actionCount++;
        }
        
        return actions;
    }

    /// @notice Check if system needs intervention
    function needsIntervention() external view returns (bool) {
        uint256 totalUsers = totalFlaggedUsers + totalVerifiedUsers;
        if (totalUsers == 0) return false;
        
        uint256 flagRate = (totalFlaggedUsers * 100) / totalUsers;
        return flagRate > 20; // If more than 20% of users are flagged
    }

    /// @notice Get bot detection patterns
    function getDetectionPatterns() external pure returns (string[] memory) {
        string[] memory patterns = new string[](4);
        patterns[0] = "High activity frequency";
        patterns[1] = "Mass view patterns";
        patterns[2] = "BRN manipulation";
        patterns[3] = "Suspicious timing";
        return patterns;
    }

    /// @notice Calculate user risk score
    function calculateRiskScore(address user) external view returns (uint256) {
        uint256 baseScore = userActivityScore[user];
        uint256 suspiciousMultiplier = suspiciousActions[user] * 10;
        uint256 timeMultiplier = 1;
        
        // Reduce score over time if no recent activity
        if (lastActivityTime[user] > 0) {
            uint256 timeSinceActivity = block.timestamp - lastActivityTime[user];
            if (timeSinceActivity > 24 hours) {
                timeMultiplier = 1;
            } else if (timeSinceActivity > 12 hours) {
                timeMultiplier = 2;
            } else {
                timeMultiplier = 3;
            }
        }
        
        return (baseScore + suspiciousMultiplier) * timeMultiplier;
    }
} 