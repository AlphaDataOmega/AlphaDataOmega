// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITrustOracle {
    function getTrustScore(address user, string calldata category) external view returns (uint256);
}

contract MockTrustOracle is ITrustOracle {
    mapping(address => mapping(bytes32 => uint256)) private scores;

    function setTrustScore(address user, string memory category, uint256 score) external {
        scores[user][keccak256(bytes(category))] = score;
    }

    function getTrustScore(address user, string calldata category) external view override returns (uint256) {
        return scores[user][keccak256(bytes(category))];
    }
}
