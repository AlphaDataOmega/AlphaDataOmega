// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 sourceHash) external;
}

/// @title MerkleDropDistributor
/// @notice Allows users to claim TRN rewards from Merkle proofs based on verified engagement (e.g. views).
contract MerkleDropDistributor {
    /// @notice merkle root by drop id (e.g. daily distribution timestamp)
    mapping(uint256 => bytes32) public merkleRoots;
    address public oracle;
    address public owner;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event MerkleRootUpdated(uint256 indexed dropId, bytes32 root);
    event Claimed(uint256 indexed dropId, address indexed user, uint256 amount);

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

    /// @notice Set the Merkle root for a specific drop period
    function setMerkleRoot(bytes32 root, uint256 dropId) external onlyOwner {
        merkleRoots[dropId] = root;
        emit MerkleRootUpdated(dropId, root);
    }

    /// @notice Claim TRN with Merkle proof for a given drop
    function claim(uint256 dropId, address account, uint256 amount, bytes32[] calldata proof) external {
        require(!hasClaimed[dropId][account], "Already claimed");

        bytes32 leaf = keccak256(abi.encode(account, amount));
        require(MerkleProof.verify(proof, merkleRoots[dropId], leaf), "Invalid proof");

        hasClaimed[dropId][account] = true;
        emit Claimed(dropId, account, amount);

        ITRNUsageOracle(oracle).reportEarning(account, amount, keccak256("merkle-drop"));
    }
}
