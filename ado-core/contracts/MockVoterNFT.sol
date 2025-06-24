// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockVoterNFT is ERC721 {
    uint256 public nextId = 1;

    constructor() ERC721("VoterNFT", "VOTE") {}

    function mint(address to) external {
        _mint(to, nextId++);
    }
}
