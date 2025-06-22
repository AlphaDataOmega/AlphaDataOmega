// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ViewIndex
/// @notice Registers posts and logs views for TRN rewards.
contract ViewIndex {
    /// @dev post hash => total views
    mapping(bytes32 => uint256) public viewCounts;

    /// @dev post hash => original author
    mapping(bytes32 => address) public originalAuthor;

    /// @dev post hash => first time seen
    mapping(bytes32 => uint256) public firstSeen;

    event PostRegistered(bytes32 indexed postHash, address indexed author, uint256 timestamp);
    event ViewLogged(bytes32 indexed postHash, address indexed viewer);

    /// @notice Called once to register a new post hash
    function registerPost(bytes32 postHash) external {
        require(originalAuthor[postHash] == address(0), "Already registered");
        originalAuthor[postHash] = msg.sender;
        firstSeen[postHash] = block.timestamp;

        emit PostRegistered(postHash, msg.sender, block.timestamp);
    }

    /// @notice Log a view for a post
    function registerView(bytes32 postHash) external {
        viewCounts[postHash] += 1;
        emit ViewLogged(postHash, msg.sender);
    }

    /// @notice Helper to fetch metadata
    function getPostMeta(bytes32 postHash) external view returns (address, uint256, uint256) {
        return (originalAuthor[postHash], firstSeen[postHash], viewCounts[postHash]);
    }
}
