// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
}

contract MockContributorVault {
    mapping(address => uint256) public claimable;

    event Claimed(address indexed user, uint256 amount);

    function mockDistribute(address user, uint256 amount) external {
        claimable[user] += amount;
    }

    function claim(address oracle) external {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing to claim");
        claimable[msg.sender] = 0;
        emit Claimed(msg.sender, amount);
        ITRNUsageOracle(oracle).reportEarning(msg.sender, amount, keccak256("contributor-vault"));
    }
}
