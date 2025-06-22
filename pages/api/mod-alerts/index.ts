import { loadAlertsFromStorageOrIPFS } from "@/utils/modAlerts";

export default async function handler(req, res) {
  const alerts = await loadAlertsFromStorageOrIPFS();
  res.status(200).json(alerts);
}
