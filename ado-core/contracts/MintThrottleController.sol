// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
}

/// @title MintThrottleController
/// @notice Controls inflation, burn pressure, and debt balancing
/// @dev Manages TRN minting rates and debt settlement mechanisms
contract MintThrottleController is Ownable {
    ITRNUsageOracle public immutable trnOracle;
    
    uint256 public constant MAX_DAILY_MINT = 1000000 * 10**18; // 1M TRN per day
    uint256 public constant DEBT_THRESHOLD = 1000 * 10**18; // 1K TRN debt threshold
    uint256 public constant BURN_PRESSURE_MULTIPLIER = 2; // 2x burn pressure when debt high
    
    uint256 public dailyMintLimit;
    uint256 public currentDailyMinted;
    uint256 public lastMintReset;
    uint256 public totalDebt;
    uint256 public burnPressure;
    
    mapping(address => bool) public authorizedMinters;
    mapping(address => uint256) public userDebt;
    
    event MintThrottled(address indexed user, uint256 requested, uint256 allowed);
    event DebtIncreased(address indexed user, uint256 amount);
    event DebtSettled(address indexed user, uint256 amount);
    event BurnPressureUpdated(uint256 oldPressure, uint256 newPressure);
    event DailyMintReset(uint256 newLimit);

    constructor(address _trnOracle) Ownable() {
        trnOracle = ITRNUsageOracle(_trnOracle);
        dailyMintLimit = MAX_DAILY_MINT;
        lastMintReset = block.timestamp;
    }

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    /// @notice Authorize a contract to mint TRN
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /// @notice Check if minting is allowed and calculate allowed amount
    function checkMintAllowance(address user, uint256 requestedAmount) external view returns (uint256 allowedAmount) {
        // Reset daily mint counter if 24 hours have passed
        if (block.timestamp >= lastMintReset + 1 days) {
            allowedAmount = requestedAmount;
        } else {
            // Check daily limit
            uint256 remainingDaily = dailyMintLimit - currentDailyMinted;
            allowedAmount = requestedAmount > remainingDaily ? remainingDaily : requestedAmount;
        }
        
        // Apply debt pressure
        if (userDebt[user] > DEBT_THRESHOLD) {
            allowedAmount = allowedAmount / BURN_PRESSURE_MULTIPLIER;
        }
        
        return allowedAmount;
    }

    /// @notice Record a mint operation
    function recordMint(address user, uint256 amount) external onlyAuthorizedMinter {
        // Reset daily counter if needed
        if (block.timestamp >= lastMintReset + 1 days) {
            currentDailyMinted = 0;
            lastMintReset = block.timestamp;
            emit DailyMintReset(dailyMintLimit);
        }
        
        currentDailyMinted += amount;
        
        // Check if mint was throttled
        uint256 allowed = this.checkMintAllowance(user, amount);
        if (allowed < amount) {
            emit MintThrottled(user, amount, allowed);
        }
    }

    /// @notice Increase user debt
    function increaseDebt(address user, uint256 amount) external onlyAuthorizedMinter {
        userDebt[user] += amount;
        totalDebt += amount;
        
        emit DebtIncreased(user, amount);
        
        // Update burn pressure based on total debt
        updateBurnPressure();
    }

    /// @notice Settle user debt
    function settleDebt(address user, uint256 amount) external onlyAuthorizedMinter {
        require(userDebt[user] >= amount, "Insufficient debt to settle");
        
        userDebt[user] -= amount;
        totalDebt -= amount;
        
        emit DebtSettled(user, amount);
        
        // Update burn pressure based on total debt
        updateBurnPressure();
    }

    /// @notice Update burn pressure based on total debt
    function updateBurnPressure() internal {
        uint256 oldPressure = burnPressure;
        
        if (totalDebt > MAX_DAILY_MINT) {
            burnPressure = BURN_PRESSURE_MULTIPLIER;
        } else if (totalDebt > MAX_DAILY_MINT / 2) {
            burnPressure = (BURN_PRESSURE_MULTIPLIER * 3) / 4; // 1.5x
        } else {
            burnPressure = 1; // Normal pressure
        }
        
        if (oldPressure != burnPressure) {
            emit BurnPressureUpdated(oldPressure, burnPressure);
        }
    }

    /// @notice Get current burn pressure multiplier
    function getBurnPressure() external view returns (uint256) {
        return burnPressure;
    }

    /// @notice Check if user has debt
    function hasDebt(address user) external view returns (bool) {
        return userDebt[user] > 0;
    }

    /// @notice Get user debt amount
    function getUserDebt(address user) external view returns (uint256) {
        return userDebt[user];
    }

    /// @notice Get total system debt
    function getTotalDebt() external view returns (uint256) {
        return totalDebt;
    }

    /// @notice Get daily mint statistics
    function getDailyMintStats() external view returns (
        uint256 limit,
        uint256 minted,
        uint256 remaining,
        uint256 nextReset
    ) {
        limit = dailyMintLimit;
        minted = currentDailyMinted;
        remaining = limit > minted ? limit - minted : 0;
        nextReset = lastMintReset + 1 days;
    }

    /// @notice Update daily mint limit (governance function)
    function updateDailyMintLimit(uint256 newLimit) external onlyOwner {
        require(newLimit > 0, "Limit must be positive");
        require(newLimit <= MAX_DAILY_MINT * 2, "Limit too high");
        
        dailyMintLimit = newLimit;
        emit DailyMintReset(newLimit);
    }

    /// @notice Emergency debt reset (governance function)
    function emergencyDebtReset(address user) external onlyOwner {
        uint256 userDebtAmount = userDebt[user];
        if (userDebtAmount > 0) {
            totalDebt -= userDebtAmount;
            userDebt[user] = 0;
            emit DebtSettled(user, userDebtAmount);
            updateBurnPressure();
        }
    }

    /// @notice Force daily mint reset (emergency function)
    function forceDailyReset() external onlyOwner {
        currentDailyMinted = 0;
        lastMintReset = block.timestamp;
        emit DailyMintReset(dailyMintLimit);
    }

    /// @notice Get system health metrics
    function getSystemHealth() external view returns (
        uint256 totalSystemDebt,
        uint256 currentBurnPressure,
        uint256 dailyMintUtilization,
        bool isHealthy
    ) {
        totalSystemDebt = totalDebt;
        currentBurnPressure = burnPressure;
        dailyMintUtilization = (currentDailyMinted * 100) / dailyMintLimit;
        
        // System is healthy if debt is low and mint utilization is reasonable
        isHealthy = totalDebt < MAX_DAILY_MINT / 2 && dailyMintUtilization < 80;
    }

    /// @notice Calculate debt-to-mint ratio
    function getDebtToMintRatio() external view returns (uint256) {
        if (dailyMintLimit == 0) return 0;
        return (totalDebt * 100) / dailyMintLimit;
    }

    /// @notice Check if system needs intervention
    function needsIntervention() external view returns (bool) {
        uint256 debtRatio = this.getDebtToMintRatio();
        uint256 mintUtilization = (currentDailyMinted * 100) / dailyMintLimit;
        
        return debtRatio > 50 || mintUtilization > 90;
    }

    /// @notice Get recommended actions for system health
    function getRecommendedActions() external view returns (string[] memory) {
        string[] memory actions = new string[](3);
        uint256 actionCount = 0;
        
        if (totalDebt > MAX_DAILY_MINT) {
            actions[actionCount] = "Increase burn pressure";
            actionCount++;
        }
        
        if (currentDailyMinted > dailyMintLimit * 8 / 10) {
            actions[actionCount] = "Reduce daily mint limit";
            actionCount++;
        }
        
        if (totalDebt > MAX_DAILY_MINT / 2) {
            actions[actionCount] = "Implement debt settlement incentives";
            actionCount++;
        }
        
        return actions;
    }
} 