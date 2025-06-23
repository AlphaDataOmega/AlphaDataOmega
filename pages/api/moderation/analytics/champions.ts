export default function handler(req, res) {
  res.json([
    {
      address: "0xF00...123",
      name: "FreedomMax",
      appeals: 12,
      approved: 9,
      topCategory: "censorship",
      trustChange: 14,
    },
    {
      address: "0xB33...abc",
      name: null,
      appeals: 8,
      approved: 5,
      topCategory: "health",
      trustChange: 8,
    },
    {
      address: "0xDEAD...BEEF",
      name: "RebelNode",
      appeals: 10,
      approved: 2,
      topCategory: "politics",
      trustChange: -1,
    },
  ]);
}
