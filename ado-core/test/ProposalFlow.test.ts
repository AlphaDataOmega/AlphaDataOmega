import { ethers } from "hardhat";
import { expect } from "chai";

describe("DAO Proposal Lifecycle", () => {
  let master: any, council: any, user1: any, user2: any;
  let ProposalFactory: any, proposalFactory: any;

  beforeEach(async () => {
    [master, council, user1, user2] = await ethers.getSigners();

    const CouncilNFT = await ethers.getContractFactory("CouncilNFT");
    const MasterNFT = await ethers.getContractFactory("MasterNFT");
    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    const VoterNFT = await ethers.getContractFactory("MockVoterNFT");
    const Ruleset = await ethers.getContractFactory("MockCountryRulesetManager");
    const ProposalFactoryContract = await ethers.getContractFactory("ProposalFactory");

    const councilNFT = await CouncilNFT.deploy();
    const masterNFT = await MasterNFT.deploy();
    const oracle = await Oracle.deploy();
    const voterNFT = await VoterNFT.deploy();
    const ruleset = await Ruleset.deploy();

    await councilNFT.mint(council.address);
    await masterNFT.mint(master.address);
    await voterNFT.mint(council.address);
    await voterNFT.mint(user1.address);

    ProposalFactory = await ProposalFactoryContract.deploy(
      councilNFT.target,
      masterNFT.target,
      oracle.target,
      voterNFT.target,
      ruleset.target
    );
    proposalFactory = ProposalFactory.connect(council);
  });

  it("should create a proposal", async () => {
    const tx = await proposalFactory.createProposal(
      "Mute category X",
      "Mute category X",
      "0x"
    );
    const receipt = await tx.wait();
    const event = receipt!.logs.find((e: any) => e.fragment?.name === "ProposalCreated");
    expect(event?.args?.title).to.equal("Mute category X");
  });

  it("should allow Council to pass a proposal", async () => {
    const idTx = await proposalFactory.createProposal("Ban content", "Ban content", "0x");
    const receipt = await idTx.wait();
    const id = receipt!.logs[0]!.args!.proposalId;

    await proposalFactory.passProposal(id);
    const status = await proposalFactory.getProposalStatus(id);
    expect(status).to.equal(1);
  });

  it("should allow Master to veto", async () => {
    const idTx = await proposalFactory.createProposal("Allow spam", "Allow spam", "0x");
    const id = (await idTx.wait()).logs[0].args.proposalId;

    await proposalFactory.passProposal(id);
    const masterConnected = ProposalFactory.connect(master);
    await masterConnected.vetoProposal(id);

    const status = await ProposalFactory.getProposalStatus(id);
    expect(status).to.equal(3);
  });

  it("should allow full passage to user vote", async () => {
    const idTx = await proposalFactory.createProposal("Mute Y", "Mute Y", "0x");
    const id = (await idTx.wait()).logs[0].args.proposalId;

    await proposalFactory.passProposal(id);
    const masterConnected = ProposalFactory.connect(master);
    await masterConnected.approveProposal(id);

    const status = await ProposalFactory.getProposalStatus(id);
    expect(status).to.equal(2);
  });

  it("should not allow duplicate execution or invalid state transitions", async () => {
    const idTx = await proposalFactory.createProposal("Test", "Test", "0x");
    const id = (await idTx.wait()).logs[0].args.proposalId;

    await proposalFactory.passProposal(id);
    await expect(proposalFactory.passProposal(id)).to.be.revertedWith("Already passed");
  });
});
