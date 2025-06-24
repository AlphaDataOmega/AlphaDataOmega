import { ethers } from "hardhat";
import { expect } from "chai";

describe("DAO Proposal Lifecycle", () => {
  let master: any, council: any, user1: any, user2: any;
  let ProposalFactory: any, proposalFactory: any;

  beforeEach(async () => {
    [master, council, user1, user2] = await ethers.getSigners();

    const CouncilNFT = await ethers.getContractFactory("CouncilNFT");
    const MasterNFT = await ethers.getContractFactory("MasterNFT");
    const ProposalFactoryContract = await ethers.getContractFactory("ProposalFactory");

    const councilNFT = await CouncilNFT.deploy();
    const masterNFT = await MasterNFT.deploy();

    await councilNFT.mint(council.address);
    await masterNFT.mint(master.address);

    ProposalFactory = await ProposalFactoryContract.deploy(councilNFT.target, masterNFT.target);
    proposalFactory = ProposalFactory.connect(council);
  });

  it("should create a proposal", async () => {
    const tx = await proposalFactory.createProposal("Mute category X", 1);
    const receipt = await tx.wait();
    const event = receipt!.logs.find((e: any) => e.fragment?.name === "ProposalCreated");
    expect(event?.args?.description).to.equal("Mute category X");
  });

  it("should allow Council to pass a proposal", async () => {
    const idTx = await proposalFactory.createProposal("Ban content", 2);
    const receipt = await idTx.wait();
    const id = receipt!.logs[0]!.args!.proposalId;

    await proposalFactory.passProposal(id);
    const status = await proposalFactory.getProposalStatus(id);
    expect(status).to.equal(1);
  });

  it("should allow Master to veto", async () => {
    const idTx = await proposalFactory.createProposal("Allow spam", 3);
    const id = (await idTx.wait()).logs[0].args.proposalId;

    await proposalFactory.passProposal(id);
    const masterConnected = ProposalFactory.connect(master);
    await masterConnected.vetoProposal(id);

    const status = await ProposalFactory.getProposalStatus(id);
    expect(status).to.equal(3);
  });

  it("should allow full passage to user vote", async () => {
    const idTx = await proposalFactory.createProposal("Mute Y", 5);
    const id = (await idTx.wait()).logs[0].args.proposalId;

    await proposalFactory.passProposal(id);
    const masterConnected = ProposalFactory.connect(master);
    await masterConnected.approveProposal(id);

    const status = await ProposalFactory.getProposalStatus(id);
    expect(status).to.equal(2);
  });

  it("should not allow duplicate execution or invalid state transitions", async () => {
    const idTx = await proposalFactory.createProposal("Test", 5);
    const id = (await idTx.wait()).logs[0].args.proposalId;

    await proposalFactory.passProposal(id);
    await expect(proposalFactory.passProposal(id)).to.be.revertedWith("Already passed");
  });
});
