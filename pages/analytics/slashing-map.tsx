import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Load map client-side
const MapChart = dynamic(() => import("@/components/WorldHeatmap"), { ssr: false });

export default function SlashingMapPage() {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch("/api/dao/slashing-map")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌍 Regional Slashing Heatmap</h1>
      <MapChart data={data} />
    </div>
  );
}
