// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TRNUsageOracle.sol";

/// @title TRN↔USD Internal AMM
/// @notice Internal automated market maker for TRN↔USD swaps with price anchoring
/// @dev Maintains TRN ≈ $0.003 USD price through internal liquidity pools
contract TRNUSDAMM is Ownable {
    TRNUsageOracle public immutable trnOracle;
    
    uint256 public constant TARGET_PRICE = 3000; // $0.003 USD = 3000 wei
    uint256 public constant PRICE_TOLERANCE = 100; // ±$0.001 tolerance
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_SLIPPAGE = 500; // 5% max slippage
    
    uint256 public trnReserve;
    uint256 public usdReserve; // In wei (1 USD = 10^18 wei)
    
    mapping(address => bool) public authorizedOperators;
    
    event SwapTRNtoUSD(address indexed user, uint256 trnAmount, uint256 usdAmount);
    event SwapUSDtoTRN(address indexed user, uint256 usdAmount, uint256 trnAmount);
    event LiquidityAdded(address indexed provider, uint256 trnAmount, uint256 usdAmount);
    event LiquidityRemoved(address indexed provider, uint256 trnAmount, uint256 usdAmount);
    event PriceUpdate(uint256 oldPrice, uint256 newPrice);

    constructor(address _trnOracle) Ownable() {
        trnOracle = TRNUsageOracle(_trnOracle);
    }

    modifier onlyAuthorized() {
        require(authorizedOperators[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    /// @notice Authorize a contract to perform operations
    function authorizeOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
    }

    /// @notice Add liquidity to the AMM
    function addLiquidity(uint256 trnAmount, uint256 usdAmount) external onlyOwner {
        require(trnAmount > 0 && usdAmount > 0, "Amounts must be positive");
        
        // Calculate target ratio based on $0.003 price
        uint256 targetUSD = (trnAmount * TARGET_PRICE) / BASIS_POINTS;
        require(usdAmount >= targetUSD * (BASIS_POINTS - PRICE_TOLERANCE) / BASIS_POINTS, "USD amount too low");
        require(usdAmount <= targetUSD * (BASIS_POINTS + PRICE_TOLERANCE) / BASIS_POINTS, "USD amount too high");
        
        // Transfer TRN from owner
        require(trnOracle.getAvailableTRN(msg.sender) >= trnAmount, "Insufficient TRN");
        trnOracle.reportSpend(msg.sender, trnAmount, "usd-amm-liquidity");
        
        // Transfer USD (would need USD token or stablecoin integration)
        // For now, we'll assume USD is provided via other means
        
        trnReserve += trnAmount;
        usdReserve += usdAmount;
        
        emit LiquidityAdded(msg.sender, trnAmount, usdAmount);
    }

    /// @notice Remove liquidity from the AMM
    function removeLiquidity(uint256 trnAmount, uint256 usdAmount) external onlyOwner {
        require(trnAmount > 0 && usdAmount > 0, "Amounts must be positive");
        require(trnAmount <= trnReserve && usdAmount <= usdReserve, "Insufficient reserves");
        
        // Transfer TRN to owner
        trnOracle.reportEarning(msg.sender, trnAmount, keccak256("usd-amm-liquidity"));
        
        // Transfer USD (would need USD token or stablecoin integration)
        
        trnReserve -= trnAmount;
        usdReserve -= usdAmount;
        
        emit LiquidityRemoved(msg.sender, trnAmount, usdAmount);
    }

    /// @notice Swap TRN for USD
    function swapTRNtoUSD(uint256 trnAmount) external {
        require(trnAmount > 0, "Amount must be positive");
        require(trnReserve > 0 && usdReserve > 0, "Insufficient liquidity");
        
        uint256 usdAmount = getUSDOut(trnAmount);
        
        // Check slippage protection
        uint256 expectedUSD = (trnAmount * TARGET_PRICE) / BASIS_POINTS;
        uint256 minUSD = expectedUSD * (BASIS_POINTS - MAX_SLIPPAGE) / BASIS_POINTS;
        require(usdAmount >= minUSD, "Slippage too high");
        
        // Transfer TRN from user
        require(trnOracle.getAvailableTRN(msg.sender) >= trnAmount, "Insufficient TRN");
        trnOracle.reportSpend(msg.sender, trnAmount, "swap-to-usd");
        
        // Transfer USD to user (would need USD token integration)
        
        trnReserve += trnAmount;
        usdReserve -= usdAmount;
        
        emit SwapTRNtoUSD(msg.sender, trnAmount, usdAmount);
    }

    /// @notice Swap USD for TRN
    function swapUSDtoTRN(uint256 usdAmount) external {
        require(usdAmount > 0, "Amount must be positive");
        require(trnReserve > 0 && usdReserve > 0, "Insufficient liquidity");
        
        uint256 trnAmount = getTRNOut(usdAmount);
        
        // Check slippage protection
        uint256 expectedTRN = (usdAmount * BASIS_POINTS) / TARGET_PRICE;
        uint256 minTRN = expectedTRN * (BASIS_POINTS - MAX_SLIPPAGE) / BASIS_POINTS;
        require(trnAmount >= minTRN, "Slippage too high");
        
        // Transfer USD from user (would need USD token integration)
        
        // Transfer TRN to user
        trnOracle.reportEarning(msg.sender, trnAmount, keccak256("swap-from-usd"));
        
        trnReserve -= trnAmount;
        usdReserve += usdAmount;
        
        emit SwapUSDtoTRN(msg.sender, usdAmount, trnAmount);
    }

    /// @notice Calculate USD output for given TRN input
    function getUSDOut(uint256 trnAmount) public view returns (uint256) {
        require(trnReserve > 0 && usdReserve > 0, "Insufficient liquidity");
        
        uint256 trnAmountWithFee = trnAmount * 997 / 1000; // 0.3% fee
        uint256 numerator = trnAmountWithFee * usdReserve;
        uint256 denominator = trnReserve + trnAmountWithFee;
        
        return numerator / denominator;
    }

    /// @notice Calculate TRN output for given USD input
    function getTRNOut(uint256 usdAmount) public view returns (uint256) {
        require(trnReserve > 0 && usdReserve > 0, "Insufficient liquidity");
        
        uint256 usdAmountWithFee = usdAmount * 997 / 1000; // 0.3% fee
        uint256 numerator = usdAmountWithFee * trnReserve;
        uint256 denominator = usdReserve + usdAmountWithFee;
        
        return numerator / denominator;
    }

    /// @notice Get current TRN price in USD (in wei)
    function getCurrentPrice() external view returns (uint256) {
        if (trnReserve == 0) return TARGET_PRICE;
        return (usdReserve * BASIS_POINTS) / trnReserve;
    }

    /// @notice Check if price is within target range
    function isPriceStable() external view returns (bool) {
        uint256 currentPrice = this.getCurrentPrice();
        uint256 upperBound = TARGET_PRICE + PRICE_TOLERANCE;
        uint256 lowerBound = TARGET_PRICE - PRICE_TOLERANCE;
        
        return currentPrice >= lowerBound && currentPrice <= upperBound;
    }

    /// @notice Get reserves
    function getReserves() external view returns (uint256, uint256) {
        return (trnReserve, usdReserve);
    }

    /// @notice Emergency price stabilization
    function emergencyPriceStabilization() external onlyAuthorized {
        uint256 currentPrice = this.getCurrentPrice();
        uint256 oldPrice = currentPrice;
        
        if (currentPrice > TARGET_PRICE + PRICE_TOLERANCE) {
            // Price too high - add TRN or remove USD
            uint256 targetTRN = (usdReserve * BASIS_POINTS) / TARGET_PRICE;
            if (trnReserve < targetTRN) {
                // Add TRN to lower price
                uint256 trnNeeded = targetTRN - trnReserve;
                trnOracle.reportEarning(address(this), trnNeeded, keccak256("emergency-stabilization"));
                trnReserve += trnNeeded;
            }
        } else if (currentPrice < TARGET_PRICE - PRICE_TOLERANCE) {
            // Price too low - add USD or remove TRN
            uint256 targetUSD = (trnReserve * TARGET_PRICE) / BASIS_POINTS;
            if (usdReserve < targetUSD) {
                // Add USD to raise price
                uint256 usdNeeded = targetUSD - usdReserve;
                usdReserve += usdNeeded;
            }
        }
        
        emit PriceUpdate(oldPrice, this.getCurrentPrice());
    }

    /// @notice Update target price (governance function)
    function updateTargetPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be positive");
        uint256 oldPrice = TARGET_PRICE;
        // Note: TARGET_PRICE is constant, so this would need to be implemented differently
        // For now, we'll emit an event to track price changes
        emit PriceUpdate(oldPrice, newPrice);
    }

    /// @notice Get utilization percentage
    function getUtilization() external view returns (uint256) {
        if (trnReserve == 0 && usdReserve == 0) return 0;
        
        uint256 totalValue = trnReserve + (usdReserve * TARGET_PRICE) / BASIS_POINTS;
        uint256 maxCapacity = 1000000 * 10**18; // 1M tokens max capacity
        
        return (totalValue * 100) / maxCapacity;
    }
} 