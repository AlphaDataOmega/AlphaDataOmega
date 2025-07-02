// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title SubscriptionNFT
/// @notice Token-gated content access NFT that cannot be re-purchased once burned
/// @dev Permanently revoked if burned, used for premium content access
contract SubscriptionNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    mapping(address => bool) public hasMinted;
    mapping(uint256 => bool) public isBurned;
    mapping(uint256 => string) public subscriptionType; // tokenId => subscription type
    mapping(uint256 => uint256) public expiryTime; // tokenId => expiry timestamp
    mapping(address => bool) public authorizedBurners;
    
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    
    event SubscriptionMinted(address indexed to, uint256 tokenId, string subscriptionType);
    event SubscriptionBurned(uint256 indexed tokenId, address indexed burner);
    event SubscriptionExtended(uint256 indexed tokenId, uint256 newExpiry);
    event SubscriptionTypeChanged(uint256 indexed tokenId, string newType);

    constructor() ERC721("ADO Subscription", "ADOSUB") Ownable() {}

    modifier onlyAuthorizedBurner() {
        require(authorizedBurners[msg.sender] || msg.sender == owner(), "Not authorized to burn");
        _;
    }

    /// @notice Authorize a contract to burn subscriptions
    function authorizeBurner(address burner) external onlyOwner {
        authorizedBurners[burner] = true;
    }

    /// @notice Mint a new subscription NFT
    function mint(address to) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(to, newTokenId);
        return newTokenId;
    }

    /// @notice Burn a subscription (permanently revoked)
    function burn(uint256 tokenId) external onlyAuthorizedBurner {
        require(_exists(tokenId), "Token does not exist");
        require(!isBurned[tokenId], "Already burned");
        require(ownerOf(tokenId) != address(0), "Token not owned");
        
        address owner = ownerOf(tokenId);
        _burn(tokenId);
        isBurned[tokenId] = true;
        
        // Mark address as having had a subscription (cannot mint again)
        hasMinted[owner] = true;
        
        emit SubscriptionBurned(tokenId, msg.sender);
    }

    /// @notice Extend subscription duration
    function extendSubscription(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        require(!isBurned[tokenId], "Token is burned");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        expiryTime[tokenId] += SUBSCRIPTION_DURATION;
        
        emit SubscriptionExtended(tokenId, expiryTime[tokenId]);
    }

    /// @notice Change subscription type
    function changeSubscriptionType(uint256 tokenId, string calldata newType) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(!isBurned[tokenId], "Token is burned");
        require(bytes(newType).length > 0, "Invalid subscription type");
        
        subscriptionType[tokenId] = newType;
        
        emit SubscriptionTypeChanged(tokenId, newType);
    }

    /// @notice Check if subscription is active
    function isSubscriptionActive(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId) || isBurned[tokenId]) {
            return false;
        }
        return expiryTime[tokenId] > block.timestamp;
    }

    /// @notice Check if address has active subscription
    function hasActiveSubscription(address user) external view returns (bool) {
        // Check if user has any active subscription
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (ownerOf(i) == user && !isBurned[i] && expiryTime[i] > block.timestamp) {
                return true;
            }
        }
        return false;
    }

    /// @notice Get subscription info
    function getSubscriptionInfo(uint256 tokenId) external view returns (
        address owner,
        string memory subType,
        uint256 expiry,
        bool burned,
        bool active
    ) {
        if (!_exists(tokenId)) {
            return (address(0), "", 0, false, false);
        }
        
        owner = ownerOf(tokenId);
        subType = subscriptionType[tokenId];
        expiry = expiryTime[tokenId];
        burned = isBurned[tokenId];
        active = !burned && expiry > block.timestamp;
    }

    /// @notice Get user's subscription token ID
    function getUserSubscriptionToken(address user) external view returns (uint256) {
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (ownerOf(i) == user && !isBurned[i]) {
                return i;
            }
        }
        return 0;
    }

    /// @notice Override transfer to prevent transfers (subscriptions are non-transferable)
    function transferFrom(address from, address to, uint256 tokenId) public pure override {
        revert("Subscriptions are non-transferable");
    }

    /// @notice Override safeTransferFrom to prevent transfers
    function safeTransferFrom(address from, address to, uint256 tokenId) public pure override {
        revert("Subscriptions are non-transferable");
    }

    /// @notice Override safeTransferFrom with data to prevent transfers
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public pure override {
        revert("Subscriptions are non-transferable");
    }

    /// @notice Override approve to prevent transfers
    function approve(address to, uint256 tokenId) public pure override {
        revert("Subscriptions are non-transferable");
    }

    /// @notice Override setApprovalForAll to prevent transfers
    function setApprovalForAll(address operator, bool approved) public pure override {
        revert("Subscriptions are non-transferable");
    }

    /// @notice Get total supply of NFTs
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    /// @notice Get total burned subscriptions
    function totalBurned() external view returns (uint256) {
        uint256 burned = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (isBurned[i]) {
                burned++;
            }
        }
        return burned;
    }

    /// @notice Emergency function to recover stuck subscriptions
    function emergencyRecover(uint256 tokenId, address to) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(!isBurned[tokenId], "Token is burned");
        
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, to, tokenId);
    }
} 