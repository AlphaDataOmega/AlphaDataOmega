import { useEffect, useState } from "react";

export default function DAOAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dao/inflow")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="p-4">Loading analytics...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🏛️ DAO Inflow Analytics</h1>
      <h2 className="text-xl font-bold mt-8">🔥 Slashing Summary</h2>
      <ul>
        {Object.entries(data.slashingByCategoryAndRegion).map(
          ([country, catMap]) => (
            <li key={country}>
              <strong>{country}:</strong>{" "}
              {Object.entries(catMap)
                .map(([cat, brn]) => `${cat}: ${brn} BRN`)
                .join(", ")}
            </li>
          )
        )}
      </ul>
    </div>
  );
}
