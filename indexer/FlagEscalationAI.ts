import { getTrustWeight } from "../shared/TrustWeightedOracle";

export type Flag = { user: string };

export function calculateEffectiveFlags(flags: Flag[]): number {
  return flags.reduce((acc, f) => acc + getTrustWeight(f.user), 0);
}

export function shouldEscalate(flags: Flag[], threshold = 5): boolean {
  return calculateEffectiveFlags(flags) >= threshold;
}
