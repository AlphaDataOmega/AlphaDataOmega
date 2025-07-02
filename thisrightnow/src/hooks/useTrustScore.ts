import { fetchTrustScore } from "@/utils/fetchTrustScore";
import { useState, useEffect } from "react";

export function useTrustScore(address: string, category = "general") {
  const [score, setScore] = useState<number>(50);

  useEffect(() => {
    if (!address) return;
    fetchTrustScore(address, category).then(setScore);
  }, [address, category]);

  return { score };
}

// Later, replace this with calls to:
// - TrustScoreEngine.ts
// - ModerationLog indexer
// - Vault + AI training signals
