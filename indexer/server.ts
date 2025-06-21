import express from "express";
import { getPostEarningsFromChain } from "./postEarnings";
import { getUserEarnings } from "./userEarnings";

const app = express();
app.get("/api/earnings/post/:hash", async (req, res) => {
  const hash = req.params.hash;
  const earnings = await getPostEarningsFromChain(hash);
  res.json(earnings);
});

app.get("/api/earnings/user/:addr", async (req, res) => {
  const { addr } = req.params;
  try {
    const data = await getUserEarnings(addr);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to get user earnings" });
  }
});

app.listen(4000, () => console.log("\ud83d\dd0c Earnings API at http://localhost:4000"));
