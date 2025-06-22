// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITRNUsageOracle {
    function reportSpend(address user, uint256 amount, string calldata action) external;
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
    function reportTransfer(address from, address to, uint256 amount) external;
}

/// @title BoostingModule
/// @notice Allows creators to fund boosts for their posts. Viewers earn TRN from the allocated budget.
contract BoostingModule {
    event BoostStarted(address indexed booster, bytes32 indexed postHash, uint256 trnAmount, uint256 timestamp);
    event BoostEnded(bytes32 indexed postHash, address indexed booster, uint256 timestamp);

    struct Boost {
        address booster;
        uint256 amount;       // total funded
        uint256 remaining;    // unspent amount
        uint256 startTime;
        bool active;
    }

    IERC20 public token;
    ITRNUsageOracle public oracle;

    mapping(bytes32 => Boost) public boosts;
    mapping(bytes32 => mapping(address => uint256)) public viewerEarnings;
    mapping(address => uint256) public refunds;

    constructor(address _token, address _oracle) {
        token = IERC20(_token);
        oracle = ITRNUsageOracle(_oracle);
    }

    /// @notice Starts a boost campaign. Only the post creator should call this in production.
    function startBoost(bytes32 postHash, uint256 trnAmount) external {
        require(!boosts[postHash].active, "Already boosted");
        require(trnAmount > 0, "TRN required");

        token.transferFrom(msg.sender, address(this), trnAmount);
        oracle.reportSpend(msg.sender, trnAmount, "boost");

        boosts[postHash] = Boost({
            booster: msg.sender,
            amount: trnAmount,
            remaining: trnAmount,
            startTime: block.timestamp,
            active: true
        });

        emit BoostStarted(msg.sender, postHash, trnAmount, block.timestamp);
    }

    /// @notice Registers a view of a boosted post and allocates earnings to the viewer.
    function registerBoostView(bytes32 postHash) external {
        Boost storage boost = boosts[postHash];
        require(boost.active, "Not active");
        require(boost.remaining > 0, "No funds");

        uint256 reward = 1e18;
        if (reward > boost.remaining) {
            reward = boost.remaining;
        }

        boost.remaining -= reward;
        viewerEarnings[postHash][msg.sender] += reward;
        oracle.reportEarning(msg.sender, reward, postHash);
    }

    function claimable(bytes32 postHash, address viewer) external view returns (uint256) {
        return viewerEarnings[postHash][viewer];
    }

    /// @notice Ends a boost early (e.g. when a post is burned) and refunds the remaining TRN.
    function burnPost(bytes32 postHash) external {
        Boost storage boost = boosts[postHash];
        require(msg.sender == boost.booster, "Not booster");
        require(boost.active, "Not active");

        boost.active = false;
        uint256 remaining = boost.remaining;
        boost.remaining = 0;

        if (remaining > 0) {
            refunds[boost.booster] += remaining;
            token.transfer(boost.booster, remaining);
            oracle.reportEarning(boost.booster, remaining, keccak256("boost-refund"));
        }

        emit BoostEnded(postHash, boost.booster, block.timestamp);
    }

    function getBoost(bytes32 postHash) external view returns (Boost memory) {
        return boosts[postHash];
    }
}
