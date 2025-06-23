// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function getTrustScore(address contributor, string memory category) external view returns (uint256);
    function notifyEarnings(address contributor, uint256 amount) external;
}

/// @title MockContributorVault
/// @notice Simple vault used in tests. Supports direct claims and a trust-weighted distribution.
contract MockContributorVault {
    // Legacy claim flow used in existing tests
    mapping(address => uint256) public claimable;

    // Trust-weighted distribution state
    address public owner;
    IERC20 public trn;
    ITRNUsageOracle public oracle;
    address[] public contributors;
    mapping(address => uint256) public earned;

    event Claimed(address indexed user, uint256 amount);

    constructor(address token, address oracleAddr) {
        owner = msg.sender;
        trn = IERC20(token);
        oracle = ITRNUsageOracle(oracleAddr);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Mock function to pre-load claimable amounts
    function mockDistribute(address user, uint256 amount) external {
        claimable[user] += amount;
    }

    /// @notice Legacy claim that reports earnings to the oracle
    function claim(address oracleAddr) external {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing to claim");
        claimable[msg.sender] = 0;
        emit Claimed(msg.sender, amount);
        ITRNUsageOracle(oracleAddr).reportEarning(msg.sender, amount, keccak256("contributor-vault"));
    }

    /// @notice Set earned amount for a contributor (used by tests)
    function setEarned(address contributor, uint256 amount) external onlyOwner {
        if (earned[contributor] == 0) {
            contributors.push(contributor);
        }
        earned[contributor] = amount;
    }

    /// @notice Distribute TRN to contributors weighted by their trust score
    function distribute(string memory category) public onlyOwner {
        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint256 base = earned[contributor];
            if (base == 0) continue;

            uint256 trust = oracle.getTrustScore(contributor, category); // 0-100
            uint256 adjusted = (base * trust) / 100;

            require(trn.transfer(contributor, adjusted), "Transfer failed");
            oracle.notifyEarnings(contributor, adjusted);
            earned[contributor] = 0;
        }
    }
}

