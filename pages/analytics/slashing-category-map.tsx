import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapChart = dynamic(() => import("@/components/WorldHeatmap"), { ssr: false });

export default function SlashingCategoryMapPage() {
  const [data, setData] = useState<Record<string, Record<string, number>>>({});
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch("/api/dao/slashing-category-map")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const categories = Array.from(
    new Set(
      Object.values(data).flatMap((m) => Object.keys(m))
    )
  );

  const mapData = Object.fromEntries(
    Object.entries(data).map(([country, cats]) => [country, cats[category] || 0])
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔥 Slashing by Category &amp; Region</h1>
      <select
        className="border p-2 mb-4"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {category && <MapChart data={mapData} />}
    </div>
  );
}
