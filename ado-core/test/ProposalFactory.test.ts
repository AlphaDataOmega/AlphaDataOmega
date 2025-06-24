import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProposalFactory", function () {
  let factory: any;
  let voterNFT: any;
  let oracle: any;
  let ruleset: any;
  let council: any;
  let voter: any;

  beforeEach(async () => {
    [council, voter] = await ethers.getSigners();

    const VoterNFT = await ethers.getContractFactory("MockVoterNFT");
    voterNFT = await VoterNFT.deploy();
    await voterNFT.mint(voter.address);
    await voterNFT.mint(council.address);

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();
    await oracle.reportEarning(
      voter.address,
      ethers.parseEther("10"),
      ethers.keccak256(ethers.toUtf8Bytes("seed"))
    );

    const Ruleset = await ethers.getContractFactory("MockCountryRulesetManager");
    ruleset = await Ruleset.deploy();

    const CouncilNFT = await ethers.getContractFactory("CouncilNFT");
    const councilNFT = await CouncilNFT.deploy();
    await councilNFT.mint(council.address);

    const ProposalFactory = await ethers.getContractFactory("ProposalFactory");
    factory = await ProposalFactory.deploy(
      councilNFT.target,
      councilNFT.target,
      oracle.target,
      voterNFT.target,
      ruleset.target
    );
    factory = factory.connect(council);
  });

  it("should create a proposal", async () => {
    const tx = await factory.createProposal(
      "Test",
      "Mute memes in Canada",
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "string", "string"],
        ["muteCategory", "memes", "Canada"]
      )
    );
    await tx.wait();

    const proposal = await factory.proposals(1);
    expect(proposal.title).to.equal("Test");
  });

  it("should allow a voter to vote", async () => {
    await factory.createProposal("Test", "Mute memes", "0x");

    await factory.connect(voter).vote(1, true);
    const updated = await factory.proposals(1);

    expect(updated.yesVotes).to.equal(1);
  });

  it("should not allow double voting", async () => {
    await factory.createProposal("Test", "Mute memes", "0x");
    await factory.connect(voter).vote(1, true);

    await expect(factory.connect(voter).vote(1, false)).to.be.revertedWith("Already voted");
  });

  it("should execute a proposal and mute the category", async () => {
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "string"],
      ["muteCategory", "memes", "Canada"]
    );

    await factory.createProposal("Test", "Mute memes", payload);
    await factory.connect(voter).vote(1, true);

    const tx = await factory.executeProposal(1);
    await expect(tx)
      .to.emit(ruleset, "CategoryMuted")
      .withArgs("Canada", "memes", true);
  });

  it("should not execute if not passed", async () => {
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "string"],
      ["muteCategory", "memes", "Canada"]
    );

    await factory.createProposal("Fail", "Try mute", payload);
    await factory.connect(voter).vote(1, false);

    await expect(factory.executeProposal(1)).to.be.revertedWith("Proposal did not pass");
  });

  it("should not execute twice", async () => {
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "string"],
      ["muteCategory", "memes", "Canada"]
    );

    await factory.createProposal("Test", "Mute memes", payload);
    await factory.connect(voter).vote(1, true);
    await factory.executeProposal(1);

    await expect(factory.executeProposal(1)).to.be.revertedWith("Already executed");
  });
});
