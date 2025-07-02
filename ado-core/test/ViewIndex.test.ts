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

  it("should throttle duplicate views within 1 hour", async function () {
    const [author, viewer] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    const hash = ethers.encodeBytes32String("post123");
    const category = "engagement.view";
    const regionCode = "US";
    const trustScoreHint = 80;

    await viewIndex.connect(author).registerPost(hash, category, regionCode);
    await viewIndex.connect(viewer).registerView(hash, category, regionCode, trustScoreHint);
    await expect(
      viewIndex.connect(viewer).registerView(hash, category, regionCode, trustScoreHint)
    ).to.be.revertedWith("View throttled");
  });

  it("should emit correct fields in ViewLogged event", async function () {
    const [author, viewer] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    const hash = ethers.encodeBytes32String("post456");
    const category = "post.tech";
    const regionCode = "CA";
    const trustScoreHint = 55;

    await viewIndex.connect(author).registerPost(hash, category, regionCode);
    await expect(
      viewIndex.connect(viewer).registerView(hash, category, regionCode, trustScoreHint)
    )
      .to.emit(viewIndex, "ViewLogged")
      .withArgs(hash, viewer.address, category, regionCode, trustScoreHint);
  });

  it("should log boosted views and emit BoostedViewLogged", async function () {
    const [author, viewer] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    const hash = ethers.encodeBytes32String("post789");
    const category = "post.science";
    const regionCode = "UK";
    const trustScoreHint = 99;

    await viewIndex.connect(author).registerPost(hash, category, regionCode);
    await expect(
      viewIndex.connect(viewer).recordBoostedView(hash, category, regionCode, trustScoreHint)
    )
      .to.emit(viewIndex, "BoostedViewLogged")
      .withArgs(hash, viewer.address, category, regionCode, trustScoreHint);
  });

  it("should revert double registration of post", async function () {
    const [author] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    const hash = ethers.encodeBytes32String("post123");
    const category = "engagement.view";
    const regionCode = "US";
    await viewIndex.connect(author).registerPost(hash, category, regionCode);
    await expect(viewIndex.connect(author).registerPost(hash, category, regionCode)).to.be.revertedWith(
      "Already registered"
    );
  });
});
