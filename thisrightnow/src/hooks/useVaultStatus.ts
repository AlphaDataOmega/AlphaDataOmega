export function useVaultStatus() {
  const initialized = localStorage.getItem("ado.vault.initialized") === "true";
  const unlocked = localStorage.getItem("ado.vault.unlocked") === "true";
  return { initialized, unlocked };
}
