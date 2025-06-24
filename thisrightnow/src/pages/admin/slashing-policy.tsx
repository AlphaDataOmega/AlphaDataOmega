import { useEffect, useState } from "react";
import { loadContract } from "@/utils/contract";
import SlashingPolicyABI from "@/abi/SlashingPolicyManager.json";

export default function SlashingPolicyPage() {
  const [thresholds, setThresholds] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({ country: "", category: "", value: 0 });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const contract = await loadContract("SlashingPolicyManager", SlashingPolicyABI);
    const mockCountries = ["USA", "UK", "IN"];
    const mockCategories = ["politics", "violence", "spam"];
    const entries = [] as Array<{ country: string; category: string; value: number }>;

    for (const country of mockCountries) {
      for (const cat of mockCategories) {
        const t = await (contract as any).getThreshold(country, cat);
        entries.push({ country, category: cat, value: Number(t) });
      }
    }

    setThresholds(entries);
  };

  const handleUpdate = async () => {
    const contract = await loadContract(
      "SlashingPolicyManager",
      SlashingPolicyABI,
      true,
    );
    await (contract as any).setThreshold(
      newEntry.country,
      newEntry.category,
      newEntry.value,
    );
    await loadAll();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🌐 Slashing Policy Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-100 p-4 rounded mb-6">
        <input
          className="p-2 border rounded"
          placeholder="Country"
          value={newEntry.country}
          onChange={(e) => setNewEntry({ ...newEntry, country: e.target.value })}
        />
        <input
          className="p-2 border rounded"
          placeholder="Category"
          value={newEntry.category}
          onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
        />
        <input
          type="number"
          className="p-2 border rounded"
          placeholder="Threshold"
          value={newEntry.value}
          onChange={(e) => setNewEntry({ ...newEntry, value: Number(e.target.value) })}
        />
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2 sm:col-span-3"
        >
          Set Threshold
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Country</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {thresholds.map((t, i) => (
            <tr key={i}>
              <td className="p-2 border">{t.country}</td>
              <td className="p-2 border">{t.category}</td>
              <td className="p-2 border">{t.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
