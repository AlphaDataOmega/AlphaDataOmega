import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import claimData from '../data/merkle-2025-06-18.json';
import MerkleDropABI from '../abi/MerkleDropDistributor.json';

export default function ClaimPage() {
  const { address, connector } = useAccount();
  const claim = claimData.claims.find(
    (c: { viewer: string }) =>
      c.viewer.toLowerCase() === address?.toLowerCase()
  );

  async function handleClaim() {
    if (!claim || !connector) return;
    const provider = new ethers.BrowserProvider(
      (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
    );
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      '0xYourDistributor',
      MerkleDropABI,
      signer
    );
    await contract.claim(claim.amount, claim.proof);
  }

  return claim ? (
    <button onClick={handleClaim}>Claim {claim.amount} TRN</button>
  ) : (
    <p>No eligible claims</p>
  );
}
