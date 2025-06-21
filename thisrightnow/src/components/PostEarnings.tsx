import { useEffect, useState } from "react";
import { getPostEarnings } from "@/utils/fetchPostEarnings";

export default function PostEarnings({ postHash }: { postHash: string }) {
  const [earnings, setEarnings] = useState<any>(null);

  useEffect(() => {
    getPostEarnings(postHash).then(setEarnings);
  }, [postHash]);

  if (!earnings) return null;

  return (
    <div className="p-3 bg-yellow-50 rounded border mb-4">
      <h3 className="font-semibold text-sm mb-2">💸 Post Earnings</h3>
      <ul className="text-sm text-gray-800">
        <li>👁️ Views: {earnings.views} TRN</li>
        <li>🔁 Retrns: {earnings.retrns} TRN</li>
        <li>🔥 Blessings: {earnings.blessings} TRN</li>
        <li>🧠 Resonance Bonus: {earnings.resonance} TRN</li>
        <li>🏦 Vault Bonus: {earnings.vault || 0} TRN</li>
        <li className="font-bold mt-2">Total: {earnings.total} TRN</li>
      </ul>
    </div>
  );
}
