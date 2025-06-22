// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContributorNFT is ERC721URIStorage, Ownable {
    uint256 public nextId;
    mapping(address => bool) public hasMinted;
    mapping(address => string) public vaultCID;

    event VaultLinked(address indexed contributor, string cid);

    constructor() ERC721("Contributor NFT", "CNFT") Ownable(msg.sender) {}

    function mintContributor(string calldata cid) external {
        require(!hasMinted[msg.sender], "Already minted");

        uint256 tokenId = nextId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, cid);

        vaultCID[msg.sender] = cid;
        hasMinted[msg.sender] = true;

        emit VaultLinked(msg.sender, cid);
    }

    function getVaultCID(address contributor) external view returns (string memory) {
        return vaultCID[contributor];
    }
}
