// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./TRNUsageOracle.sol";

interface IVoterNFT {
    function balanceOf(address owner) external view returns (uint256);
}

interface ICountryRulesetManager {
    function setCategoryMuted(
        string calldata country,
        string calldata category,
        bool muted
    ) external;
}

/// @title ProposalFactory
/// @notice Simplified governance proposal manager for testing.
contract ProposalFactory {
    enum Status { Created, Passed, Approved, Vetoed }

    struct Proposal {
        string title;
        string description;
        bytes payload;
        Status status;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(address => bool) voted;
    }

    IERC721 public councilNFT;
    IERC721 public masterNFT;
    TRNUsageOracle public oracle;
    IVoterNFT public voterNFT;
    ICountryRulesetManager public rulesetManager;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed proposalId, string title);
    event ProposalPassed(uint256 indexed proposalId);
    event ProposalApproved(uint256 indexed proposalId);
    event ProposalVetoed(uint256 indexed proposalId);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event VoteCast(uint256 proposalId, address voter, bool support);
    event Executed(uint256 indexed proposalId);

    constructor(
        address _councilNFT,
        address _masterNFT,
        address _oracle,
        address _voterNFT,
        address _rulesetManager
    ) {
        councilNFT = IERC721(_councilNFT);
        masterNFT = IERC721(_masterNFT);
        oracle = TRNUsageOracle(_oracle);
        voterNFT = IVoterNFT(_voterNFT);
        rulesetManager = ICountryRulesetManager(_rulesetManager);
    }

    modifier onlyCouncil() {
        require(councilNFT.balanceOf(msg.sender) > 0, "Not council");
        _;
    }

    modifier onlyMaster() {
        require(masterNFT.balanceOf(msg.sender) > 0, "Not master");
        _;
    }

    function createProposal(
        string calldata title,
        string calldata description,
        bytes calldata payload
    ) external onlyCouncil returns (uint256) {
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.title = title;
        p.description = description;
        p.payload = payload;
        p.status = Status.Created;
        emit ProposalCreated(proposalCount, title);
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

    function vote(uint256 proposalId, bool support) external {
        require(voterNFT.balanceOf(msg.sender) > 0, "Not a voter");
        Proposal storage p = proposals[proposalId];
        require(!p.voted[msg.sender], "Already voted");

        oracle.reportSpend(msg.sender, 1e18, "vote");

        if (support) {
            p.yesVotes += 1;
        } else {
            p.noVotes += 1;
        }

        p.voted[msg.sender] = true;

        emit Voted(proposalId, msg.sender, support);
        emit VoteCast(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "Already executed");
        require(p.yesVotes > p.noVotes, "Proposal did not pass");

        (string memory action, string memory category, string memory country) =
            abi.decode(p.payload, (string, string, string));

        if (keccak256(bytes(action)) == keccak256("muteCategory")) {
            rulesetManager.setCategoryMuted(country, category, true);
        }

        p.executed = true;
        emit Executed(proposalId);
    }

    function getProposalStatus(uint256 id) external view returns (uint8) {
        return uint8(proposals[id].status);
    }
}
