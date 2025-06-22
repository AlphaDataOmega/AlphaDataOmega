// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockTRN
/// @notice Simple ERC20 token used for testing TRN flows.
contract MockTRN is ERC20 {
    constructor() ERC20("Turncoin", "TRN") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
