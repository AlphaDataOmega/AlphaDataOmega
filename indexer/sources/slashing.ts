import { getLogs } from "../utils/getLogs";
import FlagEscalatorABI from "../abis/FlagEscalator.json";

export async function getSlashingInflow(): Promise<number> {
  const logs = await getLogs("FlagEscalator", FlagEscalatorABI, "PostSlashed");

  const total = logs.reduce((acc: number, log: any) => {
    const amount = Number(log.args?.brnAmount || 0);
    return acc + amount;
  }, 0);

  return total;
}
