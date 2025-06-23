// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BurnRegistry.sol";

/// @title FlagEscalator
/// @notice Processes escalated flags and slashes BRN to the DAO treasury when community burn threshold is met.
contract FlagEscalator {
    event PostSlashed(bytes32 indexed postHash, uint256 brnAmount, address indexed treasury);

    IERC20 public BRN;
    BurnRegistry public burnRegistry;
    address public moderationBot;
    address public daoTreasury;

    uint256 public constant BURN_THRESHOLD = 10;

    // Track BRN staked per post locally for quick access
    mapping(bytes32 => uint256) public brnStaked;

    constructor(address _brn, address _burnRegistry, address _daoTreasury, address _moderationBot) {
        BRN = IERC20(_brn);
        burnRegistry = BurnRegistry(_burnRegistry);
        daoTreasury = _daoTreasury;
        moderationBot = _moderationBot;
    }

    /// @notice Records a burn event and holds BRN inside this contract
    function stakeBRN(bytes32 postHash, uint256 amount) external {
        BRN.transferFrom(msg.sender, address(this), amount);
        brnStaked[postHash] += amount;
        burnRegistry.recordBurn(msg.sender, postHash, amount);
    }

    function getBurnRatio(bytes32 postHash) public view returns (uint256) {
        return brnStaked[postHash];
    }

    function pruneContent(bytes32 /*postHash*/) internal {
        // In real implementation, this would log to ModerationLog
    }

    /// @notice Called by the moderation bot after AI escalation
    function processEscalation(bytes32 postHash) external {
        require(msg.sender == moderationBot, "Only AI/modbot");

        if (getBurnRatio(postHash) >= BURN_THRESHOLD) {
            pruneContent(postHash);

            uint256 brn = brnStaked[postHash];
            brnStaked[postHash] = 0;

            BRN.transfer(daoTreasury, brn);
            burnRegistry.clearStake(postHash);

            emit PostSlashed(postHash, brn, daoTreasury);
        }
    }
}
