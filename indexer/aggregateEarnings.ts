export { aggregateEarnings } from './aggregator';

import { getViewEarnings } from './sources/views';
import { getRetrnEarnings } from './sources/retrns';
import { getBoostEarnings } from './sources/boost';
import { getVaultEarnings } from './sources/vaults';
import { getLottoEarnings } from './sources/lotto';
import { getSlashingInflow } from './sources/slashing';
import { getSlashingByCountry } from './sources/slashingByCountry';
import { getSlashingByCountryAndCategory } from './sources/slashingByCountryAndCategory';

function sum(obj: Record<string, number>): number {
  return Object.values(obj).reduce((a, b) => a + b, 0);
}

export async function aggregateInflow() {
  const [views, retrns, boosts, vaults, lotto] = await Promise.all([
    getViewEarnings(),
    getRetrnEarnings(),
    getBoostEarnings(),
    getVaultEarnings(),
    getLottoEarnings(),
  ]);

  const slashing = await getSlashingInflow();
  const slashingByRegion = await getSlashingByCountry();
  const slashingByCategoryAndRegion = await getSlashingByCountryAndCategory();

  return {
    view: sum(views),
    retrn: sum(retrns),
    boost: sum(boosts),
    vaults: sum(vaults),
    lotto: sum(lotto),
    slashing,
    slashingByRegion,
    slashingByCategoryAndRegion,
  };
}
