// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
    function getAvailableTRN(address user) external view returns (uint256);
}

interface IFruitBalanceTracker {
    function canPerformAction(address user, uint256 amount) external view returns (bool);
    function spendFruit(address user, uint256 amount, string calldata reason) external;
}

interface ISubscriptionNFT {
    function mint(address to) external returns (uint256);
    function totalSupply() external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title SubscriptionManager
/// @notice Handles NFT renewals and payment enforcement post-drop
/// @dev Manages subscription lifecycle and payment processing
contract SubscriptionManager is Ownable {
    ISubscriptionNFT public immutable subscriptionNFT;
    ITRNUsageOracle public immutable trnOracle;
    IFruitBalanceTracker public immutable fruitTracker;
    
    uint256 public constant RENEWAL_GRACE_PERIOD = 7 days;
    uint256 public constant MAX_SUBSCRIPTION_PRICE = 1000 * 10**18; // 1K TRN max
    uint256 public totalSubscriptions;
    
    struct Subscription {
        address owner;
        uint256 price;
        uint256 duration;
        uint256 expiryTime;
        bool isActive;
        bool autoRenew;
    }
    
    mapping(uint256 => Subscription) public subscriptions;
    
    event SubscriptionCreated(uint256 indexed tokenId, address indexed owner, uint256 price, uint256 duration);
    event SubscriptionRenewed(uint256 indexed tokenId, address indexed owner, uint256 amount, uint256 newExpiry);
    event SubscriptionExpired(uint256 indexed tokenId, address indexed owner);
    event SubscriptionCancelled(uint256 indexed tokenId, address indexed owner);
    event PriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);

    constructor(
        address _subscriptionNFT,
        address _trnOracle,
        address _fruitTracker
    ) Ownable() {
        subscriptionNFT = ISubscriptionNFT(_subscriptionNFT);
        trnOracle = ITRNUsageOracle(_trnOracle);
        fruitTracker = IFruitBalanceTracker(_fruitTracker);
    }

    /// @notice Create a new subscription
    function createSubscription(
        address owner,
        uint256 price,
        uint256 duration
    ) external onlyOwner returns (uint256 tokenId) {
        require(owner != address(0), "Invalid owner address");
        require(price > 0, "Price must be positive");
        require(duration > 0, "Duration must be positive");
        
        // Mint NFT
        tokenId = subscriptionNFT.mint(owner);
        
        // Set subscription details
        subscriptions[tokenId] = Subscription({
            owner: owner,
            price: price,
            duration: duration,
            expiryTime: block.timestamp + duration,
            isActive: true,
            autoRenew: true
        });
        
        totalSubscriptions++;
        emit SubscriptionCreated(tokenId, owner, price, duration);
    }

    /// @notice Renew a subscription
    function renewSubscription(uint256 tokenId) external {
        require(subscriptions[tokenId].isActive, "Subscription not active");
        require(msg.sender == subscriptions[tokenId].owner, "Not subscription owner");
        
        uint256 price = subscriptions[tokenId].price;
        require(trnOracle.getAvailableTRN(msg.sender) >= price, "Insufficient TRN balance");
        
        // Deduct TRN
        trnOracle.reportSpend(msg.sender, price, "subscription-renewal");
        
        // Extend subscription
        subscriptions[tokenId].expiryTime += subscriptions[tokenId].duration;
        
        emit SubscriptionRenewed(tokenId, msg.sender, price, subscriptions[tokenId].expiryTime);
    }

    /// @notice Cancel a subscription
    function cancelSubscription(uint256 tokenId) external {
        require(subscriptions[tokenId].isActive, "Subscription not active");
        require(msg.sender == subscriptions[tokenId].owner, "Not subscription owner");
        
        subscriptions[tokenId].isActive = false;
        
        emit SubscriptionCancelled(tokenId, msg.sender);
    }

    /// @notice Update subscription price
    function updateSubscriptionPrice(uint256 tokenId, uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Invalid price");
        require(subscriptions[tokenId].isActive, "Subscription not active");
        
        uint256 oldPrice = subscriptions[tokenId].price;
        subscriptions[tokenId].price = newPrice;
        
        emit PriceUpdated(tokenId, oldPrice, newPrice);
    }

    /// @notice Check if subscription is active
    function isSubscriptionActive(uint256 tokenId) external view returns (bool) {
        if (!subscriptions[tokenId].isActive) return false;
        return block.timestamp < subscriptions[tokenId].expiryTime;
    }

    /// @notice Get subscription details
    function getSubscriptionDetails(uint256 tokenId) external view returns (
        address owner,
        uint256 price,
        uint256 expiry,
        bool active,
        bool autoRenew,
        bool isExpired
    ) {
        owner = subscriptions[tokenId].owner;
        price = subscriptions[tokenId].price;
        expiry = subscriptions[tokenId].expiryTime;
        active = subscriptions[tokenId].isActive;
        autoRenew = subscriptions[tokenId].autoRenew;
        isExpired = block.timestamp >= expiry;
    }

    /// @notice Get user's active subscriptions
    function getUserSubscriptions(address user) external view returns (uint256[] memory) {
        uint256 totalSupply = subscriptionNFT.totalSupply();
        uint256[] memory tempSubscriptions = new uint256[](totalSupply);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (subscriptions[i].owner == user && this.isSubscriptionActive(i)) {
                tempSubscriptions[activeCount] = i;
                activeCount++;
            }
        }
        
        uint256[] memory userSubscriptions = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            userSubscriptions[i] = tempSubscriptions[i];
        }
        
        return userSubscriptions;
    }

    /// @notice Check if user has access to content
    function hasContentAccess(address user, uint256 requiredTokenId) external view returns (bool) {
        uint256[] memory userSubscriptions = this.getUserSubscriptions(user);
        
        for (uint256 i = 0; i < userSubscriptions.length; i++) {
            if (userSubscriptions[i] == requiredTokenId) {
                return true;
            }
        }
        
        return false;
    }

    /// @notice Get expiring subscriptions
    function getExpiringSubscriptions(uint256 withinDays) external view returns (uint256[] memory) {
        uint256 totalSupply = subscriptionNFT.totalSupply();
        uint256[] memory tempExpiring = new uint256[](totalSupply);
        uint256 expiringCount = 0;
        
        uint256 cutoffTime = block.timestamp + (withinDays * 1 days);
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (subscriptions[i].isActive && subscriptions[i].expiryTime <= cutoffTime) {
                tempExpiring[expiringCount] = i;
                expiringCount++;
            }
        }
        
        uint256[] memory expiringSubscriptions = new uint256[](expiringCount);
        for (uint256 i = 0; i < expiringCount; i++) {
            expiringSubscriptions[i] = tempExpiring[i];
        }
        
        return expiringSubscriptions;
    }

    /// @notice Process expired subscriptions
    function processExpiredSubscriptions() external onlyOwner {
        uint256 totalSupply = subscriptionNFT.totalSupply();
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (subscriptions[i].isActive && block.timestamp >= subscriptions[i].expiryTime) {
                subscriptions[i].isActive = false;
                emit SubscriptionExpired(i, subscriptions[i].owner);
            }
        }
    }

    /// @notice Emergency function to extend subscription
    function emergencyExtendSubscription(uint256 tokenId, uint256 additionalDays) external onlyOwner {
        require(subscriptions[tokenId].isActive, "Subscription not active");
        
        subscriptions[tokenId].expiryTime += (additionalDays * 1 days);
        emit SubscriptionRenewed(tokenId, subscriptions[tokenId].owner, 0, subscriptions[tokenId].expiryTime);
    }

    /// @notice Emergency function to cancel subscription
    function emergencyCancelSubscription(uint256 tokenId) external onlyOwner {
        subscriptions[tokenId].isActive = false;
        emit SubscriptionCancelled(tokenId, subscriptions[tokenId].owner);
    }

    /// @notice Get subscription statistics
    function getSubscriptionStats() external view returns (
        uint256 totalSubscriptions,
        uint256 activeSubscriptions,
        uint256 expiredSubscriptions,
        uint256 totalRevenue,
        uint256 averagePrice
    ) {
        totalSubscriptions = subscriptionNFT.totalSupply();
        uint256 totalRev = 0;
        uint256 activeCount = 0;
        uint256 expiredCount = 0;
        
        for (uint256 i = 1; i <= totalSubscriptions; i++) {
            if (subscriptions[i].isActive) {
                if (this.isSubscriptionActive(i)) {
                    activeCount++;
                } else {
                    expiredCount++;
                }
                totalRev += subscriptions[i].price;
            }
        }
        
        activeSubscriptions = activeCount;
        expiredSubscriptions = expiredCount;
        totalRevenue = totalRev;
        
        if (totalSubscriptions > 0) {
            averagePrice = totalRevenue / totalSubscriptions;
        }
    }

    /// @notice Check if subscription needs renewal
    function needsRenewal(uint256 tokenId) external view returns (bool) {
        if (!subscriptions[tokenId].isActive) return false;
        
        uint256 expiry = subscriptions[tokenId].expiryTime;
        return block.timestamp >= expiry - RENEWAL_GRACE_PERIOD;
    }

    /// @notice Get renewal deadline
    function getRenewalDeadline(uint256 tokenId) external view returns (uint256) {
        if (!subscriptions[tokenId].isActive) return 0;
        
        uint256 expiry = subscriptions[tokenId].expiryTime;
        return expiry - RENEWAL_GRACE_PERIOD;
    }

    /// @notice Calculate renewal cost
    function getRenewalCost(uint256 tokenId) external view returns (uint256) {
        if (!subscriptions[tokenId].isActive) return 0;
        
        return subscriptions[tokenId].price;
    }

    /// @notice Get subscription utilization
    function getSubscriptionUtilization() external view returns (uint256) {
        uint256 totalSubscriptions = subscriptionNFT.totalSupply();
        if (totalSubscriptions == 0) return 0;
        
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= totalSubscriptions; i++) {
            if (subscriptions[i].isActive && this.isSubscriptionActive(i)) {
                activeCount++;
            }
        }
        
        return (activeCount * 100) / totalSubscriptions;
    }
} 