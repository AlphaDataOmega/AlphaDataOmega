import { useEffect, useState } from 'react';

export function useVaultStatus(userId?: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = localStorage.getItem("ado.vault.initialized") === "true";
  const unlocked = localStorage.getItem("ado.vault.unlocked") === "true";

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`/api/vault/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setBalance(data.balance ?? 0);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setIsLoading(false);
      });
  }, [userId]);

  return { initialized, unlocked, balance, isLoading, error };
}
