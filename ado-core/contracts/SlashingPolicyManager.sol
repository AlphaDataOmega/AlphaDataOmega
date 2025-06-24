// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SlashingPolicyManager {
    address public owner;

    // country -> category -> BRN threshold
    mapping(string => mapping(string => uint256)) public thresholds;

    event ThresholdSet(string country, string category, uint256 newThreshold);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setThreshold(string memory country, string memory category, uint256 threshold) external onlyOwner {
        thresholds[country][category] = threshold;
        emit ThresholdSet(country, category, threshold);
    }

    function getThreshold(string memory country, string memory category) external view returns (uint256) {
        return thresholds[country][category];
    }

    function batchSet(string[] calldata countries, string[] calldata categories, uint256[] calldata values) external onlyOwner {
        require(countries.length == categories.length && categories.length == values.length, "Length mismatch");
        for (uint256 i = 0; i < countries.length; i++) {
            thresholds[countries[i]][categories[i]] = values[i];
            emit ThresholdSet(countries[i], categories[i], values[i]);
        }
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
