import { getViewEarnings } from './sources/views';
import { getRetrnEarnings } from './sources/retrns';
import { getBlessBurnEarnings } from './sources/blessBurn';
import { getVaultEarnings } from './sources/vaults';
import { getLottoEarnings } from './sources/lotto';

export async function aggregateEarnings() {
  const [views, retrns, blessBurns, vaults, lotto] = await Promise.all([
    getViewEarnings(),
    getRetrnEarnings(),
    getBlessBurnEarnings(),
    getVaultEarnings(),
    getLottoEarnings(),
  ]);

  const allAddresses = new Set([
    ...Object.keys(views),
    ...Object.keys(retrns),
    ...Object.keys(blessBurns),
    ...Object.keys(vaults),
    ...Object.keys(lotto),
  ]);

  const earnings: Record<string, any> = {};

  for (const addr of allAddresses) {
    const v = (views as Record<string, number>)[addr] || 0;
    const r = (retrns as Record<string, number>)[addr] || 0;
    const b = (blessBurns as Record<string, number>)[addr] || 0;
    const va = (vaults as Record<string, number>)[addr] || 0;
    const l = (lotto as Record<string, number>)[addr] || 0;
    const total = v + r + b + va + l;

    earnings[addr] = {
      total,
      breakdown: {
        views: v,
        retrns: r,
        blessings: b,
        vaults: va,
        lotto: l,
      },
      trustMap: {}, // Optional: fill if needed
    };
  }

  return earnings;
}
