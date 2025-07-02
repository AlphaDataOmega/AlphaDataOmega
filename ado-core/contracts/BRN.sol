// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BRN (Burncoin)
/// @notice Non-transferable token minted when TRN is burned. Used for downvotes, retrns, and burn actions.
/// @dev BRN is non-transferable and can only be burned or staked. Pegged 1:1 with TRN via internal AMM.
contract BRN is ERC20, Ownable {
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public authorizedBurners;
    
    event BRNMinted(address indexed to, uint256 amount, bytes32 indexed source);
    event BRNBurned(address indexed from, uint256 amount, bytes32 indexed postHash);
    event BRNStaked(address indexed user, uint256 amount, bytes32 indexed postHash);
    event BRNUnstaked(address indexed user, uint256 amount, bytes32 indexed postHash);

    constructor() ERC20("Burncoin", "BRN") Ownable() {}

    /// @notice Only authorized contracts can mint BRN
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _;
    }

    /// @notice Only authorized contracts can burn BRN
    modifier onlyAuthorizedBurner() {
        require(authorizedBurners[msg.sender], "Not authorized to burn");
        _;
    }

    /// @notice Authorize a contract to mint BRN (e.g., TRNUsageOracle when TRN is burned)
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /// @notice Authorize a contract to burn BRN (e.g., FlagEscalator, LottoModule)
    function authorizeBurner(address burner) external onlyOwner {
        authorizedBurners[burner] = true;
    }

    /// @notice Mint BRN when TRN is burned (1:1 ratio)
    function mint(address to, uint256 amount, bytes32 source) external onlyAuthorizedMinter {
        _mint(to, amount);
        emit BRNMinted(to, amount, source);
    }

    /// @notice Burn BRN for actions like downvotes, retrns, moderation
    function burn(address from, uint256 amount, bytes32 postHash) external onlyAuthorizedBurner {
        _burn(from, amount);
        emit BRNBurned(from, amount, postHash);
    }

    /// @notice Stake BRN on a post (for moderation actions)
    function stakeBRN(address user, uint256 amount, bytes32 postHash) external onlyAuthorizedBurner {
        _burn(user, amount);
        emit BRNStaked(user, amount, postHash);
    }

    /// @notice Unstake BRN from a post (if moderation action is reversed)
    function unstakeBRN(address user, uint256 amount, bytes32 postHash) external onlyAuthorizedBurner {
        _mint(user, amount);
        emit BRNUnstaked(user, amount, postHash);
    }

    /// @notice Override transfer to prevent BRN transfers
    function transfer(address to, uint256 amount) public pure override returns (bool) {
        revert("BRN is non-transferable");
    }

    /// @notice Override transferFrom to prevent BRN transfers
    function transferFrom(address from, address to, uint256 amount) public pure override returns (bool) {
        revert("BRN is non-transferable");
    }

    /// @notice Override approve to prevent BRN transfers
    function approve(address spender, uint256 amount) public pure override returns (bool) {
        revert("BRN is non-transferable");
    }

    /// @notice Get total supply (for AMM calculations)
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    /// @notice Get balance (for AMM calculations)
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }
} 