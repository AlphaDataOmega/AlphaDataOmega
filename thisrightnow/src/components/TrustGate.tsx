import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { loadContract } from "@/utils/contract";
import ContributorNFT from "@/abi/ContributorNFT.json";

export default function TrustGate({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!address) return;
    const check = async () => {
      try {
        const contract = await loadContract(
          "ContributorNFT",
          ContributorNFT as any,
        );
        const minted = await (contract as any).hasMinted(address);
        const cid = await (contract as any).getVaultCID(address);
        if (minted && cid.length > 0) {
          setHasAccess(true);
        }
      } catch (err) {
        console.error("eTRN_id check failed", err);
      }
    };
    check();
  }, [address]);

  if (!address) return <p>Connect wallet to continue.</p>;
  if (!hasAccess)
    return (
      <div className="bg-yellow-100 p-4 rounded text-sm text-yellow-800">
        <p>
          ⚠️ You need to mint your
          <strong>eTRN_id — your verified identity key to the ADO ecosystem</strong>
          to use this feature.
        </p>
        <a href="/mint" className="underline text-blue-600">
          Go mint now →
        </a>
      </div>
    );

  return <>{children}</>;
}
