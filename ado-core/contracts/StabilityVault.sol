// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
    function getAvailableTRN(address user) external view returns (uint256);
}

interface IBRN {
    function burn(address user, uint256 amount, bytes32 postHash) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount, bytes32 source) external;
}

/// @title StabilityVault
/// @notice Peg and liquidity balancing vault for TRN/BRN stability
/// @dev Maintains price stability and provides emergency liquidity
contract StabilityVault is Ownable {
    ITRNUsageOracle public immutable trnOracle;
    IBRN public immutable brnToken;
    
    uint256 public trnReserve;
    uint256 public brnReserve;
    uint256 public targetPegRatio = 10000; // 1:1 = 10000 basis points
    uint256 public constant PEG_TOLERANCE = 200; // 2% tolerance
    uint256 public constant BASIS_POINTS = 10000;
    
    mapping(address => bool) public authorizedOperators;
    
    event StabilityIntervention(uint256 trnAmount, uint256 brnAmount, string reason);
    event PegRatioUpdated(uint256 oldRatio, uint256 newRatio);
    event LiquidityAdded(uint256 trnAmount, uint256 brnAmount);
    event LiquidityRemoved(uint256 trnAmount, uint256 brnAmount);
    event EmergencyAction(string action, uint256 amount);

    constructor(address _trnOracle, address _brnToken) Ownable() {
        trnOracle = ITRNUsageOracle(_trnOracle);
        brnToken = IBRN(_brnToken);
    }

    modifier onlyAuthorized() {
        require(authorizedOperators[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    /// @notice Authorize a contract to perform stability operations
    function authorizeOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
    }

    /// @notice Add liquidity to stability vault
    function addLiquidity(uint256 trnAmount, uint256 brnAmount) external onlyOwner {
        require(trnAmount > 0 && brnAmount > 0, "Amounts must be positive");
        
        // Transfer TRN from owner
        require(trnOracle.getAvailableTRN(msg.sender) >= trnAmount, "Insufficient TRN");
        trnOracle.reportSpend(msg.sender, trnAmount, "stability-liquidity");
        
        // Mint BRN to vault
        brnToken.mint(address(this), brnAmount, keccak256("stability-liquidity"));
        
        trnReserve += trnAmount;
        brnReserve += brnAmount;
        
        emit LiquidityAdded(trnAmount, brnAmount);
    }

    /// @notice Remove liquidity from stability vault
    function removeLiquidity(uint256 trnAmount, uint256 brnAmount) external onlyOwner {
        require(trnAmount > 0 && brnAmount > 0, "Amounts must be positive");
        require(trnAmount <= trnReserve && brnAmount <= brnReserve, "Insufficient reserves");
        
        // Transfer TRN to owner
        trnOracle.reportEarning(msg.sender, trnAmount, keccak256("stability-liquidity"));
        
        // Burn BRN from vault
        brnToken.burn(address(this), brnAmount, keccak256("stability-liquidity"));
        
        trnReserve -= trnAmount;
        brnReserve -= brnAmount;
        
        emit LiquidityRemoved(trnAmount, brnAmount);
    }

    /// @notice Perform stability intervention to maintain peg
    function stabilityIntervention(uint256 trnAmount, uint256 brnAmount, string calldata reason) external onlyAuthorized {
        require(trnAmount > 0 || brnAmount > 0, "Must intervene with positive amount");
        
        if (trnAmount > 0) {
            require(trnAmount <= trnReserve, "Insufficient TRN reserve");
            trnOracle.reportEarning(msg.sender, trnAmount, keccak256("stability-intervention"));
            trnReserve -= trnAmount;
        }
        
        if (brnAmount > 0) {
            require(brnAmount <= brnReserve, "Insufficient BRN reserve");
            brnToken.burn(address(this), brnAmount, keccak256("stability-intervention"));
            brnReserve -= brnAmount;
        }
        
        emit StabilityIntervention(trnAmount, brnAmount, reason);
    }

    /// @notice Update target peg ratio
    function updatePegRatio(uint256 newRatio) external onlyOwner {
        require(newRatio > 0, "Ratio must be positive");
        uint256 oldRatio = targetPegRatio;
        targetPegRatio = newRatio;
        emit PegRatioUpdated(oldRatio, newRatio);
    }

    /// @notice Check if peg is within tolerance
    function isPegStable() external view returns (bool) {
        if (brnReserve == 0) return true; // No BRN means no peg pressure
        
        uint256 currentRatio = (trnReserve * BASIS_POINTS) / brnReserve;
        uint256 upperBound = targetPegRatio + PEG_TOLERANCE;
        uint256 lowerBound = targetPegRatio - PEG_TOLERANCE;
        
        return currentRatio >= lowerBound && currentRatio <= upperBound;
    }

    /// @notice Get current peg ratio
    function getCurrentPegRatio() external view returns (uint256) {
        if (brnReserve == 0) return targetPegRatio;
        return (trnReserve * BASIS_POINTS) / brnReserve;
    }

    /// @notice Calculate intervention needed to restore peg
    function calculateIntervention() external view returns (uint256 trnNeeded, uint256 brnNeeded) {
        if (brnReserve == 0) return (0, 0);
        
        uint256 currentRatio = (trnReserve * BASIS_POINTS) / brnReserve;
        
        if (currentRatio > targetPegRatio + PEG_TOLERANCE) {
            // Too much TRN relative to BRN - need to add BRN or remove TRN
            uint256 targetTRN = (brnReserve * targetPegRatio) / BASIS_POINTS;
            if (trnReserve > targetTRN) {
                trnNeeded = trnReserve - targetTRN;
            }
        } else if (currentRatio < targetPegRatio - PEG_TOLERANCE) {
            // Too much BRN relative to TRN - need to add TRN or remove BRN
            uint256 targetBRN = (trnReserve * BASIS_POINTS) / targetPegRatio;
            if (brnReserve > targetBRN) {
                brnNeeded = brnReserve - targetBRN;
            }
        }
    }

    /// @notice Emergency function to restore peg
    function emergencyPegRestoration() external onlyOwner {
        (uint256 trnNeeded, uint256 brnNeeded) = this.calculateIntervention();
        
        if (trnNeeded > 0) {
            trnOracle.reportEarning(msg.sender, trnNeeded, keccak256("emergency-peg"));
            trnReserve -= trnNeeded;
            emit EmergencyAction("TRN_removed", trnNeeded);
        }
        
        if (brnNeeded > 0) {
            brnToken.burn(address(this), brnNeeded, keccak256("emergency-peg"));
            brnReserve -= brnNeeded;
            emit EmergencyAction("BRN_removed", brnNeeded);
        }
    }

    /// @notice Get vault reserves
    function getReserves() external view returns (uint256, uint256) {
        return (trnReserve, brnReserve);
    }

    /// @notice Get vault utilization percentage
    function getUtilization() external view returns (uint256) {
        if (trnReserve == 0 && brnReserve == 0) return 0;
        
        // Calculate utilization based on how much of the vault is being used
        uint256 totalValue = trnReserve + brnReserve;
        uint256 maxCapacity = 1000000 * 10**18; // 1M tokens max capacity
        
        return (totalValue * 100) / maxCapacity;
    }

    /// @notice Emergency function to recover stuck tokens
    function emergencyRecover(address token, address to, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            // This would need to be implemented based on the token interface
            revert("Not implemented");
        }
    }

    /// @notice Pause all operations (emergency only)
    function pause() external onlyOwner {
        // Implementation would depend on OpenZeppelin's Pausable
        emit EmergencyAction("PAUSED", 0);
    }

    /// @notice Resume operations
    function unpause() external onlyOwner {
        // Implementation would depend on OpenZeppelin's Pausable
        emit EmergencyAction("UNPAUSED", 0);
    }
} 