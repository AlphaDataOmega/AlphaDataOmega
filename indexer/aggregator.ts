import { getViewEarnings } from './sources/views';
import { getRetrnEarnings } from './sources/retrns';
import { getBlessBurnEarnings } from './sources/blessBurn';
import { getVaultEarnings } from './sources/vaults';
import { getLottoEarnings } from './sources/lotto';
import { getBoostEarnings } from './sources/boost';
import { getTrustWeight, getTrustMap } from '../utils/trust';

export interface EarningsBreakdown {
  views: number;
  retrns: number;
  blessings: number;
  vaults: number;
  lotto: number;
  boosts: number;
}

export interface AggregatedEarnings {
  total: number;
  breakdown: EarningsBreakdown;
  trustMap: Record<string, number>;
}

export async function aggregateEarnings(): Promise<Record<string, AggregatedEarnings>> {
  const [views, retrns, blessBurns, vaults, lotto, boosts] = await Promise.all([
    getViewEarnings(),
    getRetrnEarnings(),
    getBlessBurnEarnings(),
    getVaultEarnings(),
    getLottoEarnings(),
    getBoostEarnings(),
  ]);

  const allAddresses = new Set<string>([
    ...Object.keys(views),
    ...Object.keys(retrns),
    ...Object.keys(blessBurns),
    ...Object.keys(vaults),
    ...Object.keys(lotto),
    ...Object.keys(boosts),
  ]);

  const earnings: Record<string, AggregatedEarnings> = {};

  for (const addr of allAddresses) {
    const tv = getTrustWeight(addr, 'views');
    const tr = getTrustWeight(addr, 'retrns');
    const tb = getTrustWeight(addr, 'blessings');
    const tvault = getTrustWeight(addr, 'vaults');
    const tlotto = getTrustWeight(addr, 'lotto');
    const tboost = getTrustWeight(addr, 'boosts');

    const v = (views[addr] || 0) * tv;
    const r = (retrns[addr] || 0) * tr;
    const b = (blessBurns[addr] || 0) * tb;
    const va = (vaults[addr] || 0) * tvault;
    const l = (lotto[addr] || 0) * tlotto;
    const bo = (boosts[addr] || 0) * tboost;

    earnings[addr] = {
      total: v + r + b + va + l + bo,
      breakdown: {
        views: v,
        retrns: r,
        blessings: b,
        vaults: va,
        lotto: l,
        boosts: bo,
      },
      trustMap: {
        views: tv,
        retrns: tr,
        blessings: tb,
        vaults: tvault,
        lotto: tlotto,
        boosts: tboost,
        ...getTrustMap(addr),
      },
    };
  }

  return earnings;
}
