import { loadContract } from './contract';
import ProposalFactoryABI from './abis/ProposalFactory.json';
import { writeFileSync } from 'fs';

const votes: any[] = [];

export async function indexVotes() {
  const contract = await loadContract('ProposalFactory', ProposalFactoryABI as any);
  const events = await contract.queryFilter('VoteCast');

  for (const e of events) {
    votes.push({
      proposalId: e.args?.proposalId.toString(),
      voter: e.args?.voter,
      support: e.args?.support,
      timestamp: (await e.getBlock()).timestamp,
    });
  }

  writeFileSync('indexer/output/votes.json', JSON.stringify(votes, null, 2));
}

if (require.main === module) {
  indexVotes().catch((err) => {
    console.error('Error indexing votes:', err);
    process.exit(1);
  });
}
