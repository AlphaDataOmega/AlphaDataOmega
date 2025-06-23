// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
}

interface ITrustOracle {
    function getTrustScore(address user, string calldata category) external view returns (uint256);
}

/// @title LottoModule
/// @notice Distributes TRN rewards to lotto winners weighted by trust score.
contract LottoModule {
    IERC20 public trn;
    ITRNUsageOracle public usageOracle;
    ITrustOracle public trustOracle;
    address public owner;

    event LottoPayout(address indexed user, string category, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _trn, address _usageOracle, address _trustOracle) {
        trn = IERC20(_trn);
        usageOracle = ITRNUsageOracle(_usageOracle);
        trustOracle = ITrustOracle(_trustOracle);
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    /// @notice Distribute TRN to winners weighted by their trust in the category
    function distribute(address[] memory winners, uint256 totalReward, string memory category) external onlyOwner {
        require(winners.length > 0, "No winners");
        uint256 baseReward = totalReward / winners.length;

        for (uint256 i = 0; i < winners.length; i++) {
            address user = winners[i];
            uint256 trust = trustOracle.getTrustScore(user, category); // 0-100
            uint256 adjusted = (baseReward * trust) / 100;

            require(trn.transfer(user, adjusted), "TRN transfer failed");
            usageOracle.reportEarning(user, adjusted, keccak256("lotto"));

            emit LottoPayout(user, category, adjusted);
        }
    }
}
