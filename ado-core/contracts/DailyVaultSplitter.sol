// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DailyVaultSplitter
/// @notice Distributes accumulated daily TRN across system modules and earning recipients.

contract DailyVaultSplitter {
    event DailySplitExecuted(uint256 totalAmount, uint256 timestamp);

    uint256 public lastSplitTime;
    uint256 public totalDailyAccumulated;

    address public stabilityVault;
    address public countryEscrowSplitter;
    address public investorVault;
    address public contributorController;

    constructor(
        address _stabilityVault,
        address _countryEscrowSplitter,
        address _investorVault,
        address _contributorController
    ) {
        stabilityVault = _stabilityVault;
        countryEscrowSplitter = _countryEscrowSplitter;
        investorVault = _investorVault;
        contributorController = _contributorController;
    }

    /// @notice Records TRN earnings to be distributed in the next daily split
    function accumulateDaily(uint256 amount) external {
        totalDailyAccumulated += amount;
    }

    /// @notice Performs the daily split. Routes TRN according to fixed logic.
    function executeSplit() external {
        require(block.timestamp > lastSplitTime + 1 days, "Split already run today");
        require(totalDailyAccumulated > 0, "Nothing to split");

        uint256 total = totalDailyAccumulated;
        lastSplitTime = block.timestamp;
        totalDailyAccumulated = 0;

        // Example breakdown (can be adjusted via DAO settings in final version)
        uint256 stabilityShare = (total * 20) / 100;
        uint256 countryShare = (total * 30) / 100;
        uint256 investorShare = (total * 33) / 100;
        uint256 contributorShare = total - stabilityShare - countryShare - investorShare;

        // In final implementation, these will call out to vault modules and UsageOracle
        // For now, just emit an event and act as placeholder

        emit DailySplitExecuted(total, block.timestamp);
    }

    function getLastSplitTime() external view returns (uint256) {
        return lastSplitTime;
    }

    function getPendingAmount() external view returns (uint256) {
        return totalDailyAccumulated;
    }
}
