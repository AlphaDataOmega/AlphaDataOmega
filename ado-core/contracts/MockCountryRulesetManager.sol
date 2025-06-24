// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockCountryRulesetManager {
    event CategoryMuted(string country, string category, bool muted);

    function setCategoryMuted(
        string calldata country,
        string calldata category,
        bool muted
    ) external {
        emit CategoryMuted(country, category, muted);
    }
}
