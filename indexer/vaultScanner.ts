import fs from 'fs';

export async function getVaultEarnings(): Promise<Record<string, number>> {
  try {
    const raw = fs.readFileSync('./output/vault-earnings.json', 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
