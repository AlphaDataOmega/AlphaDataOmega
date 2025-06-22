import { expect } from "chai";
import { ethers } from "hardhat";

describe("ContributorNFT", function () {
  it("should mint and store CID", async () => {
    const [user] = await ethers.getSigners();
    const ContributorNFT = await ethers.getContractFactory("ContributorNFT");
    const nft = await ContributorNFT.deploy();

    const cid = "Qm123";
    await nft.connect(user).mint(cid);

    expect(await nft.ownerOf(1)).to.equal(user.address);
    expect(await nft.hasMinted(user.address)).to.equal(true);
    expect(await nft.vaultCID(user.address)).to.equal(cid);
  });

  it("should reject re-mint", async () => {
    const [user] = await ethers.getSigners();
    const ContributorNFT = await ethers.getContractFactory("ContributorNFT");
    const nft = await ContributorNFT.deploy();

    await nft.connect(user).mint("CID1");
    await expect(nft.connect(user).mint("CID2")).to.be.revertedWith(
      "Already minted"
    );
  });

  it("should update vault CID", async () => {
    const [user] = await ethers.getSigners();
    const ContributorNFT = await ethers.getContractFactory("ContributorNFT");
    const nft = await ContributorNFT.deploy();

    await nft.connect(user).mint("CID1");
    await nft.connect(user).updateVaultCID("CID2");

    expect(await nft.vaultCID(user.address)).to.equal("CID2");
  });
});
