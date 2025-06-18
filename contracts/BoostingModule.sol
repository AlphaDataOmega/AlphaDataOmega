// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BoostingModule
/// @notice Allows users to boost their own posts for increased visibility and TRN payouts to viewers.
/// @dev All boosts are self-initiated. Boost ends early if the post is burned.

contract BoostingModule {
    event BoostStarted(address indexed booster, bytes32 indexed postHash, uint256 trnAmount, uint256 timestamp);
    event BoostEnded(bytes32 indexed postHash, address indexed booster, uint256 timestamp);

    struct Boost {
        address booster;
        uint256 amount;
        uint256 startTime;
        bool active;
    }

    mapping(bytes32 => Boost) public boosts;

    /// @notice Starts a boost campaign. Only the original post creator may call this.
    function startBoost(bytes32 postHash, uint256 trnAmount) external {
        require(boosts[postHash].active == false, "Already boosted");
        require(trnAmount > 0, "TRN required");

        // Placeholder check: In real logic, verify sender is post creator
        boosts[postHash] = Boost({
            booster: msg.sender,
            amount: trnAmount,
            startTime: block.timestamp,
            active: true
        });

        emit BoostStarted(msg.sender, postHash, trnAmount, block.timestamp);
    }

    /// @notice Ends a boost campaign early (e.g. on post burn). Returns unused TRN in final implementation.
    function endBoost(bytes32 postHash) external {
        Boost storage boost = boosts[postHash];
        require(boost.active, "Not active");

        boost.active = false;
        emit BoostEnded(postHash, boost.booster, block.timestamp);
    }

    /// @notice Returns boost info for a post
    function getBoost(bytes32 postHash) external view returns (Boost memory) {
        return boosts[postHash];
    }
}
