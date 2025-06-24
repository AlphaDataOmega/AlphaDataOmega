// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title ProposalFactory
/// @notice Simplified governance proposal manager for testing.
contract ProposalFactory {
    enum Status { Created, Passed, Approved, Vetoed }

    struct Proposal {
        string description;
        Status status;
    }

    IERC721 public councilNFT;
    IERC721 public masterNFT;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed proposalId, string description);
    event ProposalPassed(uint256 indexed proposalId);
    event ProposalApproved(uint256 indexed proposalId);
    event ProposalVetoed(uint256 indexed proposalId);

    constructor(address _councilNFT, address _masterNFT) {
        councilNFT = IERC721(_councilNFT);
        masterNFT = IERC721(_masterNFT);
    }

    modifier onlyCouncil() {
        require(councilNFT.balanceOf(msg.sender) > 0, "Not council");
        _;
    }

    modifier onlyMaster() {
        require(masterNFT.balanceOf(msg.sender) > 0, "Not master");
        _;
    }

    function createProposal(string calldata description, uint8 /*category*/) external onlyCouncil returns (uint256) {
        proposalCount++;
        proposals[proposalCount] = Proposal(description, Status.Created);
        emit ProposalCreated(proposalCount, description);
        return proposalCount;
    }

    function passProposal(uint256 id) external onlyCouncil {
        Proposal storage p = proposals[id];
        require(p.status == Status.Created, "Already passed");
        p.status = Status.Passed;
        emit ProposalPassed(id);
    }

    function approveProposal(uint256 id) external onlyMaster {
        Proposal storage p = proposals[id];
        require(p.status == Status.Passed, "Not passed");
        p.status = Status.Approved;
        emit ProposalApproved(id);
    }

    function vetoProposal(uint256 id) external onlyMaster {
        Proposal storage p = proposals[id];
        require(p.status == Status.Passed, "Not passed");
        p.status = Status.Vetoed;
        emit ProposalVetoed(id);
    }

    function getProposalStatus(uint256 id) external view returns (uint8) {
        return uint8(proposals[id].status);
    }
}
