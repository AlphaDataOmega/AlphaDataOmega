import { ethers } from "hardhat";

async function main() {
  const ContributorNFT = await ethers.getContractFactory("ContributorNFT");
  const nft = await ContributorNFT.deploy();
  await nft.waitForDeployment();
  console.log("ContributorNFT deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
