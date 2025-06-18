// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PostVaultSplitter
/// @notice Distributes TRN earnings for a given post among the post creator and eligible retrners.
contract PostVaultSplitter {
    event PostEarningsSplit(bytes32 indexed postHash, uint256 totalAmount, address indexed creator);

    struct PostMetadata {
        address creator;
        uint256 totalEarned;
        bool hasBeenSplit;
    }

    mapping(bytes32 => PostMetadata) public postInfo;

    /// @notice Registers a post and its creator (could be called at post creation)
    function registerPost(bytes32 postHash, address creator) external {
        require(postInfo[postHash].creator == address(0), "Already registered");
        postInfo[postHash] = PostMetadata({
            creator: creator,
            totalEarned: 0,
            hasBeenSplit: false
        });
    }

    /// @notice Records TRN earned by this post (e.g. from views or boosts)
    function addEarnings(bytes32 postHash, uint256 amount) external {
        require(postInfo[postHash].creator != address(0), "Post not registered");
        postInfo[postHash].totalEarned += amount;
    }

    /// @notice Splits earnings to the post creator (retrner logic can be added later)
    function splitEarnings(bytes32 postHash) external {
        PostMetadata storage data = postInfo[postHash];
        require(!data.hasBeenSplit, "Already split");
        require(data.totalEarned > 0, "Nothing to split");

        data.hasBeenSplit = true;

        // In real version, this would route TRN to the creator via UsageOracle
        emit PostEarningsSplit(postHash, data.totalEarned, data.creator);
    }

    /// @notice Returns current post balance
    function getPostBalance(bytes32 postHash) external view returns (uint256) {
        return postInfo[postHash].totalEarned;
    }
}
