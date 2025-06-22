import { useRouter } from "next/router";
import TrustAuditTrail from "../../../components/TrustAuditTrail";

export default function AccountTrustAuditPage() {
  const router = useRouter();
  const { addr } = router.query;

  if (!addr || typeof addr !== "string") return <p>Loading...</p>;

  return <TrustAuditTrail address={addr} />;
}
