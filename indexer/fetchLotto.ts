import { loadContract } from './contract';
import LottoABI from './abis/LottoModule.json';
import TrustOracleABI from './abis/TrustOracle.json';

function isSameDate(ts: number, date: string) {
  const d = new Date(ts * 1000).toISOString().split('T')[0];
  return d === date;
}

export async function getLottoWinners(date: string) {
  const lotto = await loadContract('LottoModule', LottoABI as any);
  const trustOracle = await loadContract('TrustOracle', TrustOracleABI as any);
  const events = await lotto.queryFilter('LottoPayout');
  const dayEvents = events.filter((e: any) => isSameDate(e.block.timestamp ?? 0, date));

  return await Promise.all(
    dayEvents.map(async (e: any) => {
      const { user, category, amount } = e.args!;
      const trust = await trustOracle.getTrustScore(user, category);
      return {
        addr: user as string,
        category: category as string,
        amount: Number(amount),
        trust: Number(trust),
      };
    })
  );
}
