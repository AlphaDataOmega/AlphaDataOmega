// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockBRN
/// @notice Simple ERC20 token used to simulate BRN for testing.
contract MockBRN is ERC20 {
    constructor() ERC20("Burncoin", "BRN") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
