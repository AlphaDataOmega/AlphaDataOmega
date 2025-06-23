export async function getCategoryFromAI(content: string): Promise<string> {
  const text = content.toLowerCase();
  if (text.includes("politic") || text.includes("government")) return "politics";
  if (text.includes("tech") || text.includes("blockchain") || text.includes("crypto")) return "tech";
  return "general";
}
