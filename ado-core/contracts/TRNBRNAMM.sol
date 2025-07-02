// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TRNUsageOracle.sol";
import "./BRN.sol";

/// @title TRN↔BRN Internal AMM
/// @notice Internal automated market maker for TRN↔BRN swaps with ±2% slippage guard
/// @dev Maintains 1:1 peg between TRN and BRN through internal liquidity pools
contract TRNBRNAMM is Ownable {
    TRNUsageOracle public immutable trnOracle;
    BRN public immutable brnToken;
    
    uint256 public constant SLIPPAGE_GUARD = 200; // 2% = 200 basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    uint256 public trnReserve;
    uint256 public brnReserve;
    
    event SwapTRNtoBRN(address indexed user, uint256 trnAmount, uint256 brnAmount);
    event SwapBRNtoTRN(address indexed user, uint256 brnAmount, uint256 trnAmount);
    event LiquidityAdded(address indexed provider, uint256 trnAmount, uint256 brnAmount);
    event LiquidityRemoved(address indexed provider, uint256 trnAmount, uint256 brnAmount);

    constructor(address _trnOracle, address _brnToken) Ownable() {
        trnOracle = TRNUsageOracle(_trnOracle);
        brnToken = BRN(_brnToken);
    }

    /// @notice Swap TRN for BRN (1:1 ratio with slippage protection)
    function swapTRNtoBRN(uint256 trnAmount) external {
        require(trnAmount > 0, "Amount must be positive");
        require(trnReserve > 0 && brnReserve > 0, "Insufficient liquidity");
        
        // Calculate BRN amount based on constant product formula
        uint256 brnAmount = getBRNOut(trnAmount);
        
        // Check slippage protection (±2%)
        uint256 expectedBRN = trnAmount; // 1:1 peg
        uint256 minBRN = expectedBRN * (BASIS_POINTS - SLIPPAGE_GUARD) / BASIS_POINTS;
        require(brnAmount >= minBRN, "Slippage too high");
        
        // Transfer TRN from user to AMM
        require(trnOracle.getAvailableTRN(msg.sender) >= trnAmount, "Insufficient TRN");
        trnOracle.reportSpend(msg.sender, trnAmount, "swap-to-brn");
        
        // Mint BRN to user
        brnToken.mint(msg.sender, brnAmount, keccak256("amm-swap"));
        
        // Update reserves
        trnReserve += trnAmount;
        brnReserve -= brnAmount;
        
        emit SwapTRNtoBRN(msg.sender, trnAmount, brnAmount);
    }

    /// @notice Swap BRN for TRN (1:1 ratio with slippage protection)
    function swapBRNtoTRN(uint256 brnAmount) external {
        require(brnAmount > 0, "Amount must be positive");
        require(trnReserve > 0 && brnReserve > 0, "Insufficient liquidity");
        
        // Calculate TRN amount based on constant product formula
        uint256 trnAmount = getTRNOut(brnAmount);
        
        // Check slippage protection (±2%)
        uint256 expectedTRN = brnAmount; // 1:1 peg
        uint256 minTRN = expectedTRN * (BASIS_POINTS - SLIPPAGE_GUARD) / BASIS_POINTS;
        require(trnAmount >= minTRN, "Slippage too high");
        
        // Burn BRN from user
        brnToken.burn(msg.sender, brnAmount, keccak256("amm-swap"));
        
        // Transfer TRN to user
        trnOracle.reportEarning(msg.sender, trnAmount, keccak256("amm-swap"));
        
        // Update reserves
        trnReserve -= trnAmount;
        brnReserve += brnAmount;
        
        emit SwapBRNtoTRN(msg.sender, brnAmount, trnAmount);
    }

    /// @notice Add liquidity to the AMM (requires equal TRN and BRN amounts)
    function addLiquidity(uint256 trnAmount, uint256 brnAmount) external onlyOwner {
        require(trnAmount > 0 && brnAmount > 0, "Amounts must be positive");
        require(trnAmount == brnAmount, "Must add equal amounts for 1:1 peg");
        
        // Transfer TRN from owner to AMM
        require(trnOracle.getAvailableTRN(msg.sender) >= trnAmount, "Insufficient TRN");
        trnOracle.reportSpend(msg.sender, trnAmount, "amm-liquidity");
        
        // Mint BRN to AMM
        brnToken.mint(address(this), brnAmount, keccak256("amm-liquidity"));
        
        // Update reserves
        trnReserve += trnAmount;
        brnReserve += brnAmount;
        
        emit LiquidityAdded(msg.sender, trnAmount, brnAmount);
    }

    /// @notice Remove liquidity from the AMM
    function removeLiquidity(uint256 trnAmount, uint256 brnAmount) external onlyOwner {
        require(trnAmount > 0 && brnAmount > 0, "Amounts must be positive");
        require(trnAmount <= trnReserve && brnAmount <= brnReserve, "Insufficient reserves");
        
        // Transfer TRN to owner
        trnOracle.reportEarning(msg.sender, trnAmount, keccak256("amm-liquidity"));
        
        // Burn BRN from AMM
        brnToken.burn(address(this), brnAmount, keccak256("amm-liquidity"));
        
        // Update reserves
        trnReserve -= trnAmount;
        brnReserve -= brnAmount;
        
        emit LiquidityRemoved(msg.sender, trnAmount, brnAmount);
    }

    /// @notice Calculate BRN output for given TRN input
    function getBRNOut(uint256 trnAmount) public view returns (uint256) {
        require(trnReserve > 0 && brnReserve > 0, "Insufficient liquidity");
        
        uint256 trnAmountWithFee = trnAmount * 997 / 1000; // 0.3% fee
        uint256 numerator = trnAmountWithFee * brnReserve;
        uint256 denominator = trnReserve + trnAmountWithFee;
        
        return numerator / denominator;
    }

    /// @notice Calculate TRN output for given BRN input
    function getTRNOut(uint256 brnAmount) public view returns (uint256) {
        require(trnReserve > 0 && brnReserve > 0, "Insufficient liquidity");
        
        uint256 brnAmountWithFee = brnAmount * 997 / 1000; // 0.3% fee
        uint256 numerator = brnAmountWithFee * trnReserve;
        uint256 denominator = brnReserve + brnAmountWithFee;
        
        return numerator / denominator;
    }

    /// @notice Get current reserves
    function getReserves() external view returns (uint256, uint256) {
        return (trnReserve, brnReserve);
    }

    /// @notice Get current price ratio (TRN/BRN)
    function getPriceRatio() external view returns (uint256) {
        if (brnReserve == 0) return 0;
        return (trnReserve * BASIS_POINTS) / brnReserve;
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
} 