// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ViewIndex
/// @notice Records unique content views per post, used for TRN airdrops and engagement rewards.
contract ViewIndex {
    event ViewLogged(address indexed viewer, bytes32 indexed postHash, uint256 timestamp);

    mapping(bytes32 => mapping(address => bool)) public hasViewed;

    function logView(bytes32 postHash) external {
        mapping(address => bool) storage viewers = hasViewed[postHash];
        require(!viewers[msg.sender], "Already viewed");
        viewers[msg.sender] = true;
        emit ViewLogged(msg.sender, postHash, block.timestamp);
    }

    function hasUserViewed(bytes32 postHash, address viewer) external view returns (bool) {
        return hasViewed[postHash][viewer];
    }
}
