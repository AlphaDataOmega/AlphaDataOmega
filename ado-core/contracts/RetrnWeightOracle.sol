// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RetrnWeightOracle {
    struct RetrnData {
        uint256 rawScore;
        uint256 adjustedScore;
        address contributor;
        uint256 timestamp;
    }

    // retrnHash => RetrnData
    mapping(bytes32 => RetrnData) public retrns;

    // parentPostHash => retrn hashes
    mapping(bytes32 => bytes32[]) public retrnsByPost;

    event RetrnScored(bytes32 indexed retrnHash, bytes32 indexed parentHash, address contributor, uint256 rawScore, uint256 adjustedScore);

    function recordRetrnScore(
        bytes32 retrnHash,
        bytes32 parentHash,
        address contributor,
        uint256 rawScore,
        uint256 adjustedScore
    ) external {
        require(retrns[retrnHash].timestamp == 0, "Retrn already recorded");

        retrns[retrnHash] = RetrnData({
            rawScore: rawScore,
            adjustedScore: adjustedScore,
            contributor: contributor,
            timestamp: block.timestamp
        });

        retrnsByPost[parentHash].push(retrnHash);

        emit RetrnScored(retrnHash, parentHash, contributor, rawScore, adjustedScore);
    }

    function getRetrnScore(bytes32 retrnHash) external view returns (uint256 rawScore, uint256 adjustedScore) {
        RetrnData memory data = retrns[retrnHash];
        return (data.rawScore, data.adjustedScore);
    }

    function getRetrnsByPost(bytes32 parentHash) external view returns (bytes32[] memory) {
        return retrnsByPost[parentHash];
    }

    function getRetrnMeta(bytes32 retrnHash) external view returns (address contributor, uint256 timestamp) {
        RetrnData memory data = retrns[retrnHash];
        return (data.contributor, data.timestamp);
    }
}
