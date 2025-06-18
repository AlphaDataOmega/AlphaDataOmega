// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RetrnIndex
/// @notice Tracks when a user shares or retrns an existing post. Enables attribution to original posts.

contract RetrnIndex {
    event RetrnLogged(address indexed retrner, bytes32 indexed retrnHash, bytes32 indexed originalPostHash, uint256 timestamp);

    mapping(bytes32 => bytes32) public retrnToOriginal;
    mapping(bytes32 => uint256) public retrnCount;

    function logRetrn(bytes32 retrnHash, bytes32 originalPostHash) external {
        require(retrnToOriginal[retrnHash] == 0, "Retrn already logged");
        retrnToOriginal[retrnHash] = originalPostHash;
        retrnCount[originalPostHash]++;
        emit RetrnLogged(msg.sender, retrnHash, originalPostHash, block.timestamp);
    }

    function getRetrnCount(bytes32 postHash) external view returns (uint256) {
        return retrnCount[postHash];
    }

    function getOriginalPost(bytes32 retrnHash) external view returns (bytes32) {
        return retrnToOriginal[retrnHash];
    }
}
