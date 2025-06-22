// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContributorNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId = 1;

    mapping(address => bool) public hasMinted;
    mapping(address => string) public vaultCID;

    event ContributorMinted(address indexed user, uint256 tokenId);
    event VaultLinked(address indexed user, string cid);

    constructor() ERC721("ContributorNFT", "cNFT") Ownable(msg.sender) {}

    function mint(string calldata _vaultCID) external {
        require(!hasMinted[msg.sender], "Already minted");
        require(bytes(_vaultCID).length > 0, "Vault CID required");

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _vaultCID);

        hasMinted[msg.sender] = true;
        vaultCID[msg.sender] = _vaultCID;

        emit ContributorMinted(msg.sender, tokenId);
        emit VaultLinked(msg.sender, _vaultCID);
    }

    function updateVaultCID(string calldata _vaultCID) external {
        require(hasMinted[msg.sender], "Must mint first");
        vaultCID[msg.sender] = _vaultCID;
        emit VaultLinked(msg.sender, _vaultCID);
    }
}
