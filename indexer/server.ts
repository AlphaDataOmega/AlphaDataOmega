import express from "express";
import { getPostEarningsFromChain } from "./postEarnings";

const app = express();
app.get("/api/earnings/post/:hash", async (req, res) => {
  const hash = req.params.hash;
  const earnings = await getPostEarningsFromChain(hash);
  res.json(earnings);
});

app.listen(4000, () => console.log("\ud83d\dd0c Earnings API at http://localhost:4000"));
