export async function fetchRecentSlashingEvents(): Promise<
  { country: string; category: string; amount: number }[]
> {
  // Replace this mock with actual log reads from BurnRegistry
  return [
    { country: "USA", category: "politics", amount: 120 },
    { country: "IN", category: "violence", amount: 80 },
    { country: "UK", category: "spam", amount: 200 },
  ];
}
