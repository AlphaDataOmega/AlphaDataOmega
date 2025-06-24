// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title MasterNFT
/// @notice NFT that grants veto/approval power in the DAO.
contract MasterNFT is ERC721 {
    uint256 public nextId = 1;

    constructor() ERC721("MasterNFT", "MASTER") {}

    /// @notice Mint a new master token to `to`.
    function mint(address to) external {
        _mint(to, nextId++);
    }
}
