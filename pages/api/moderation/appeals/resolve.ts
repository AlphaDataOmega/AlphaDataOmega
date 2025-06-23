import { resolveAppeal } from "@/utils/moderation";

export default async function handler(req, res) {
  const { postHash, decision } = req.body;
  try {
    await resolveAppeal(postHash, decision);
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
