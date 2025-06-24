// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title CouncilNFT
/// @notice Simple NFT representing DAO council membership.
contract CouncilNFT is ERC721 {
    uint256 public nextId = 1;

    constructor() ERC721("CouncilNFT", "COUNCIL") {}

    /// @notice Mint a new council token to `to`.
    function mint(address to) external {
        _mint(to, nextId++);
    }
}
