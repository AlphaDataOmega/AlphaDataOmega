import { expect } from "chai";
import { ethers } from "hardhat";

describe("ViewIndex", function () {
  it("should register a new post", async function () {
    const [author] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    const hash = ethers.encodeBytes32String("post123");

    await viewIndex.connect(author).registerPost(hash);
    const meta = await viewIndex.getPostMeta(hash);
    expect(meta[0]).to.equal(author.address);
    expect(meta[1]).to.be.gt(0);
    expect(meta[2]).to.equal(0);
  });

  it("should increment view count", async function () {
    const [author, viewer] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    const hash = ethers.encodeBytes32String("post123");

    await viewIndex.connect(author).registerPost(hash);
    await viewIndex.connect(viewer).registerView(hash);

    const meta = await viewIndex.getPostMeta(hash);
    expect(meta[2]).to.equal(1);
  });

  it("should revert when registering twice", async function () {
    const [author] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    const hash = ethers.encodeBytes32String("post123");

    await viewIndex.connect(author).registerPost(hash);
    await expect(viewIndex.connect(author).registerPost(hash)).to.be.revertedWith(
      "Already registered"
    );
  });
});
