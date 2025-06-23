export default function handler(req, res) {
  res.json({
    total: 129,
    approved: 82,
    rejected: 47,
    avgTimeMinutes: 42,
    topCategory: "politics",
    topMod: { address: "0xABC", name: "ModBot9000" },
    categories: [
      { name: "politics", count: 30, approved: 18, rejected: 12, trustChange: "+12" },
      { name: "health", count: 20, approved: 11, rejected: 9, trustChange: "+3" },
      { name: "memes", count: 9, approved: 3, rejected: 6, trustChange: "-4" },
    ],
  });
}
