// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportBurn(address user, uint256 amount, bytes32 postHash) external;
}

/// @title BlessBurnTracker
/// @notice Tracks blessings and burns for posts, enabling community moderation
contract BlessBurnTracker is Ownable {
    event PostBlessed(address indexed blesser, bytes32 indexed postHash, uint256 amount, uint256 timestamp);
    event PostBurned(address indexed burner, bytes32 indexed postHash, string reason, uint256 timestamp);

    ITRNUsageOracle public trnOracle;
    
    mapping(bytes32 => uint256) public totalBlessings; // postHash => total blessings
    mapping(bytes32 => uint256) public totalBurns; // postHash => total burns
    mapping(bytes32 => mapping(address => uint256)) public userBlessings; // postHash => user => amount
    mapping(bytes32 => mapping(address => bool)) public userBurns; // postHash => user => has burned
    mapping(bytes32 => address) public postAuthors; // postHash => author

    constructor(address _trnOracle) Ownable() {
        trnOracle = ITRNUsageOracle(_trnOracle);
    }

    /// @notice Bless a post with TRN
    function blessPost(bytes32 postHash, uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(postAuthors[postHash] != address(0), "Post not registered");
        
        trnOracle.reportSpend(msg.sender, amount, "bless");
        totalBlessings[postHash] += amount;
        userBlessings[postHash][msg.sender] += amount;
        
        emit PostBlessed(msg.sender, postHash, amount, block.timestamp);
    }

    /// @notice Burn a post (moderation action)
    function burnPost(bytes32 postHash, string calldata reason) external {
        require(postAuthors[postHash] != address(0), "Post not registered");
        require(!userBurns[postHash][msg.sender], "Already burned by this user");
        
        uint256 burnAmount = 1e18; // 1 TRN burn cost
        trnOracle.reportBurn(msg.sender, burnAmount, postHash);
        totalBurns[postHash] += burnAmount;
        userBurns[postHash][msg.sender] = true;
        
        emit PostBurned(msg.sender, postHash, reason, block.timestamp);
    }

    /// @notice Register a new post
    function registerPost(bytes32 postHash, address author) external onlyOwner {
        require(postAuthors[postHash] == address(0), "Post already registered");
        postAuthors[postHash] = author;
    }

    /// @notice Get total blessings for a post
    function getTotalBlessings(bytes32 postHash) external view returns (uint256) {
        return totalBlessings[postHash];
    }

    /// @notice Get total burns for a post
    function getTotalBurns(bytes32 postHash) external view returns (uint256) {
        return totalBurns[postHash];
    }

    /// @notice Get burn count for a post
    function getBurnCount(bytes32 postHash) external view returns (uint256) {
        return totalBurns[postHash] / 1e18; // Convert from wei to count
    }

    /// @notice Get user's blessing amount for a post
    function getUserBlessing(bytes32 postHash, address user) external view returns (uint256) {
        return userBlessings[postHash][user];
    }

    /// @notice Check if user has burned a post
    function hasUserBurned(bytes32 postHash, address user) external view returns (bool) {
        return userBurns[postHash][user];
    }

    /// @notice Get post author
    function getPostAuthor(bytes32 postHash) external view returns (address) {
        return postAuthors[postHash];
    }

    /// @notice Get post statistics
    function getPostStats(bytes32 postHash) external view returns (
        uint256 blessings,
        uint256 burns,
        address author
    ) {
        blessings = totalBlessings[postHash];
        burns = totalBurns[postHash];
        author = postAuthors[postHash];
    }
} 