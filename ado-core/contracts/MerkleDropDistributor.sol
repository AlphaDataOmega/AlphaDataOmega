// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
}

/// @title MerkleDropDistributor
/// @notice Allows users to claim TRN rewards from Merkle proofs based on verified engagement (e.g. views).
contract MerkleDropDistributor {
    bytes32 public merkleRoot;
    address public oracle;
    address public owner;
    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _oracle) {
        oracle = _oracle;
        owner = msg.sender;
    }

    /// @notice Transfer contract ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    /// @notice Set the Merkle root for the current drop period
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
    }

    /// @notice Claim TRN with Merkle proof
    function claim(uint256 amount, bytes32[] calldata proof) external {
        require(!hasClaimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");

        hasClaimed[msg.sender] = true;
        emit Claimed(msg.sender, amount);

        ITRNUsageOracle(oracle).reportEarning(msg.sender, amount, keccak256("merkle-drop"));
    }
}
