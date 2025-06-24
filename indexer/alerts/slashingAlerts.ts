import { getSlashingByCountryAndCategory } from "../sources/slashingByCountryAndCategory";

// Define your burn thresholds per category (customizable later by DAO)
const CATEGORY_THRESHOLDS: Record<string, number> = {
  politics: 500,
  religion: 400,
  satire: 300,
  health: 350,
};

export async function getSlashingAlerts(): Promise<
  Array<{ country: string; category: string; brn: number; threshold: number }>
> {
  const map = await getSlashingByCountryAndCategory();
  const alerts = [] as Array<{ country: string; category: string; brn: number; threshold: number }>;

  for (const [country, categories] of Object.entries(map)) {
    for (const [category, brn] of Object.entries(categories)) {
      const threshold = CATEGORY_THRESHOLDS[category];
      if (threshold && brn >= threshold) {
        alerts.push({ country, category, brn, threshold });
      }
    }
  }

  return alerts;
}
