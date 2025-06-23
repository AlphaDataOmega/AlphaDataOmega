import { getPendingAppeals } from "@/utils/moderationStore";

export default async function handler(req, res) {
  const appeals = await getPendingAppeals();
  res.status(200).json(appeals);
}
