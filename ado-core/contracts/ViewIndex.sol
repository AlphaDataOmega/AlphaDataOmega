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

    /// @dev post hash => viewer => last view timestamp
    mapping(bytes32 => mapping(address => uint256)) public lastViewTimestamps;

    event PostRegistered(bytes32 indexed postHash, address indexed author, uint256 timestamp, string category, string regionCode);
    event ViewLogged(bytes32 indexed postHash, address indexed viewer, string category, string regionCode, uint256 trustScoreHint);
    event BoostedViewLogged(bytes32 indexed postHash, address indexed viewer, string category, string regionCode, uint256 trustScoreHint);

    /// @notice Called once to register a new post hash
    function registerPost(bytes32 postHash, string calldata category, string calldata regionCode) external {
        require(originalAuthor[postHash] == address(0), "Already registered");
        originalAuthor[postHash] = msg.sender;
        firstSeen[postHash] = block.timestamp;

        emit PostRegistered(postHash, msg.sender, block.timestamp, category, regionCode);
    }

    /// @notice Log a view for a post, with deduplication (1hr throttle per viewer/post)
    function registerView(bytes32 postHash, string calldata category, string calldata regionCode, uint256 trustScoreHint) external {
        require(block.timestamp - lastViewTimestamps[postHash][msg.sender] >= 1 hours, "View throttled");
        lastViewTimestamps[postHash][msg.sender] = block.timestamp;
        viewCounts[postHash] += 1;
        emit ViewLogged(postHash, msg.sender, category, regionCode, trustScoreHint);
    }

    /// @notice Log a boosted view for a post, with deduplication (1hr throttle per viewer/post)
    function recordBoostedView(bytes32 postHash, string calldata category, string calldata regionCode, uint256 trustScoreHint) external {
        require(block.timestamp - lastViewTimestamps[postHash][msg.sender] >= 1 hours, "View throttled");
        lastViewTimestamps[postHash][msg.sender] = block.timestamp;
        viewCounts[postHash] += 1;
        emit BoostedViewLogged(postHash, msg.sender, category, regionCode, trustScoreHint);
    }

    /// @notice Helper to fetch metadata
    function getPostMeta(bytes32 postHash) external view returns (address, uint256, uint256) {
        return (originalAuthor[postHash], firstSeen[postHash], viewCounts[postHash]);
    }
}
