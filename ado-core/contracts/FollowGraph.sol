// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
    function getAvailableTRN(address user) external view returns (uint256);
}

interface IAIBotVerifier {
    function isUserFlagged(address user) external view returns (bool);
    function reportActivity(address user, string calldata activityType, uint256 score) external;
}

/// @title FollowGraph
/// @notice Follower logic, content routing, and feed personalization
/// @dev Manages social connections and content distribution
contract FollowGraph is Ownable {
    ITRNUsageOracle public immutable trnOracle;
    IAIBotVerifier public immutable botVerifier;
    
    uint256 public constant MAX_FOLLOWERS = 10000;
    uint256 public constant MAX_FOLLOWING = 5000;
    uint256 public constant FOLLOW_COST = 1 * 10**18; // 1 TRN to follow
    
    mapping(address => address[]) public following; // user => array of following
    mapping(address => address[]) public followers; // user => array of followers
    mapping(address => mapping(address => bool)) public isFollowing; // user => target => following
    mapping(address => mapping(address => uint256)) public followTime; // user => target => timestamp
    mapping(address => bool) public userBlocked; // user => blocked status
    mapping(address => uint256) public followingCount; // user => following count
    mapping(address => uint256) public followerCount; // user => follower count
    
    uint256 public totalFollows;
    uint256 public totalUsers;
    
    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(address indexed follower, address indexed followed, uint256 timestamp);
    event UserBlocked(address indexed user, string reason);
    event UserUnblocked(address indexed user);

    constructor(address _trnOracle, address _botVerifier) Ownable() {
        trnOracle = ITRNUsageOracle(_trnOracle);
        botVerifier = IAIBotVerifier(_botVerifier);
    }

    /// @notice Follow another user
    function follow(address target) external {
        require(target != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][target], "Already following");
        require(!botVerifier.isUserFlagged(msg.sender), "User is flagged");
        
        // Check if user can afford the follow cost
        require(trnOracle.getAvailableTRN(msg.sender) >= FOLLOW_COST, "Insufficient TRN balance");
        
        // Deduct TRN for following
        trnOracle.reportSpend(msg.sender, FOLLOW_COST, "follow");
        
        // Create follow relationship
        following[msg.sender].push(target);
        followers[target].push(msg.sender);
        isFollowing[msg.sender][target] = true;
        followTime[msg.sender][target] = block.timestamp;
        
        // Update counts
        followingCount[msg.sender]++;
        followerCount[target]++;
        totalFollows++;
        
        emit UserFollowed(msg.sender, target);
    }

    /// @notice Unfollow a user
    function unfollow(address target) external {
        require(isFollowing[msg.sender][target], "Not following target");
        
        // Remove from following array
        address[] storage followingList = following[msg.sender];
        for (uint256 i = 0; i < followingList.length; i++) {
            if (followingList[i] == target) {
                followingList[i] = followingList[followingList.length - 1];
                followingList.pop();
                break;
            }
        }
        
        // Remove from followers array
        address[] storage followersList = followers[target];
        for (uint256 i = 0; i < followersList.length; i++) {
            if (followersList[i] == msg.sender) {
                followersList[i] = followersList[followersList.length - 1];
                followersList.pop();
                break;
            }
        }
        
        // Update mappings
        isFollowing[msg.sender][target] = false;
        followTime[msg.sender][target] = 0;
        
        totalFollows--;
        
        emit UserUnfollowed(msg.sender, target, block.timestamp);
    }

    /// @notice Block a user
    function blockUser(address user, string calldata reason) external onlyOwner {
        userBlocked[user] = true;
        emit UserBlocked(user, reason);
    }

    /// @notice Unblock a user
    function unblockUser(address user) external onlyOwner {
        userBlocked[user] = false;
        emit UserUnblocked(user);
    }

    /// @notice Check if user is following target
    function isUserFollowing(address user, address target) external view returns (bool) {
        return isFollowing[user][target];
    }

    /// @notice Get user's followers
    function getUserFollowers(address user) external view returns (address[] memory) {
        return followers[user];
    }

    /// @notice Get user's following
    function getUserFollowing(address user) external view returns (address[] memory) {
        return following[user];
    }

    /// @notice Get follower count
    function getFollowerCount(address user) external view returns (uint256) {
        return followers[user].length;
    }

    /// @notice Get following count
    function getFollowingCount(address user) external view returns (uint256) {
        return following[user].length;
    }

    /// @notice Get follow time
    function getFollowTime(address user, address target) external view returns (uint256) {
        return followTime[user][target];
    }

    /// @notice Check if user is blocked
    function isUserBlocked(address user) external view returns (bool) {
        return userBlocked[user];
    }

    /// @notice Get mutual followers
    function getMutualFollowers(address user1, address user2) external view returns (address[] memory) {
        address[] memory user1Followers = followers[user1];
        address[] memory user2Followers = followers[user2];
        
        address[] memory tempMutual = new address[](user1Followers.length);
        uint256 mutualCount = 0;
        
        for (uint256 i = 0; i < user1Followers.length; i++) {
            for (uint256 j = 0; j < user2Followers.length; j++) {
                if (user1Followers[i] == user2Followers[j]) {
                    tempMutual[mutualCount] = user1Followers[i];
                    mutualCount++;
                    break;
                }
            }
        }
        
        address[] memory mutualFollowers = new address[](mutualCount);
        for (uint256 i = 0; i < mutualCount; i++) {
            mutualFollowers[i] = tempMutual[i];
        }
        
        return mutualFollowers;
    }

    /// @notice Get suggested users to follow
    function getSuggestedUsers(address user, uint256 limit) external view returns (address[] memory) {
        address[] memory userFollowing = following[user];
        address[] memory tempSuggested = new address[](limit);
        uint256 suggestedCount = 0;
        
        // Get users followed by people the user follows
        for (uint256 i = 0; i < userFollowing.length && suggestedCount < limit; i++) {
            address followedUser = userFollowing[i];
            address[] memory followedUserFollowing = following[followedUser];
            
            for (uint256 j = 0; j < followedUserFollowing.length && suggestedCount < limit; j++) {
                address suggestedUser = followedUserFollowing[j];
                
                // Skip if already following or is the user themselves
                if (suggestedUser != user && !isFollowing[user][suggestedUser] && !userBlocked[suggestedUser]) {
                    // Check if already in suggestions
                    bool alreadySuggested = false;
                    for (uint256 k = 0; k < suggestedCount; k++) {
                        if (tempSuggested[k] == suggestedUser) {
                            alreadySuggested = true;
                            break;
                        }
                    }
                    
                    if (!alreadySuggested) {
                        tempSuggested[suggestedCount] = suggestedUser;
                        suggestedCount++;
                    }
                }
            }
        }
        
        address[] memory suggestedUsers = new address[](suggestedCount);
        for (uint256 i = 0; i < suggestedCount; i++) {
            suggestedUsers[i] = tempSuggested[i];
        }
        
        return suggestedUsers;
    }

    /// @notice Get content feed for user
    function getContentFeed(address user, uint256 limit) external view returns (address[] memory) {
        address[] memory userFollowing = following[user];
        address[] memory feed = new address[](limit);
        uint256 feedCount = 0;
        
        // Add followed users to feed
        for (uint256 i = 0; i < userFollowing.length && feedCount < limit; i++) {
            if (!userBlocked[userFollowing[i]]) {
                feed[feedCount] = userFollowing[i];
                feedCount++;
            }
        }
        
        // If feed is not full, add suggested users
        if (feedCount < limit) {
            address[] memory suggested = this.getSuggestedUsers(user, limit - feedCount);
            for (uint256 i = 0; i < suggested.length && feedCount < limit; i++) {
                feed[feedCount] = suggested[i];
                feedCount++;
            }
        }
        
        return feed;
    }

    /// @notice Get user statistics
    function getUserStats(address user) external view returns (
        uint256 followerCount,
        uint256 followingCount,
        uint256 mutualFollowers,
        bool isBlocked,
        uint256 totalFollows
    ) {
        followerCount = followers[user].length;
        followingCount = following[user].length;
        isBlocked = userBlocked[user];
        totalFollows = this.getTotalFollows();
        
        // Calculate mutual followers (simplified)
        mutualFollowers = 0;
        for (uint256 i = 0; i < following[user].length; i++) {
            address followedUser = following[user][i];
            if (isFollowing[followedUser][user]) {
                mutualFollowers++;
            }
        }
    }

    /// @notice Get global statistics
    function getGlobalStats() external view returns (
        uint256 totalFollows,
        uint256 totalUsers,
        uint256 averageFollowers,
        uint256 averageFollowing
    ) {
        totalFollows = this.getTotalFollows();
        totalUsers = this.getTotalUsers();
        
        if (totalUsers > 0) {
            averageFollowers = totalFollows / totalUsers;
            averageFollowing = totalFollows / totalUsers;
        }
    }

    /// @notice Get total follows
    function getTotalFollows() external view returns (uint256) {
        return totalFollows;
    }

    /// @notice Get total users
    function getTotalUsers() external view returns (uint256) {
        return totalUsers;
    }

    /// @notice Get popular users
    function getPopularUsers(uint256 limit) external view returns (address[] memory) {
        // This would need to be implemented with a more sophisticated algorithm
        // For now, return empty array
        return new address[](0);
    }

    /// @notice Check if user can follow
    function canFollow(address user, address target) external view returns (bool) {
        if (user == target || target == address(0)) return false;
        if (userBlocked[user] || userBlocked[target]) return false;
        if (isFollowing[user][target]) return false;
        if (following[user].length >= MAX_FOLLOWING) return false;
        if (followers[target].length >= MAX_FOLLOWERS) return false;
        if (trnOracle.getAvailableTRN(user) < FOLLOW_COST) return false;
        
        return true;
    }

    /// @notice Get follow recommendations
    function getFollowRecommendations(address user, uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory scores
    ) {
        address[] memory suggested = this.getSuggestedUsers(user, limit);
        users = suggested;
        scores = new uint256[](suggested.length);
        
        // Calculate recommendation scores (simplified)
        for (uint256 i = 0; i < suggested.length; i++) {
            scores[i] = followers[suggested[i]].length; // Use follower count as score
        }
    }

    /// @notice Emergency function to remove follow
    function emergencyRemoveFollow(address follower, address followed) external onlyOwner {
        if (isFollowing[follower][followed]) {
            // Remove from following array
            address[] storage followingList = following[follower];
            for (uint256 i = 0; i < followingList.length; i++) {
                if (followingList[i] == followed) {
                    followingList[i] = followingList[followingList.length - 1];
                    followingList.pop();
                    break;
                }
            }
            
            // Remove from followers array
            address[] storage followersList = followers[followed];
            for (uint256 i = 0; i < followersList.length; i++) {
                if (followersList[i] == follower) {
                    followersList[i] = followersList[followersList.length - 1];
                    followersList.pop();
                    break;
                }
            }
            
            // Update mappings
            isFollowing[follower][followed] = false;
            followTime[follower][followed] = 0;
            
            totalFollows--;
            
            emit UserUnfollowed(follower, followed, block.timestamp);
        }
    }
} 