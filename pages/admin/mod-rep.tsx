import { useEffect, useState } from "react";

export default function ModRepPage() {
  const [mods, setMods] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/mods/rep")
      .then((res) => res.json())
      .then(setMods);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧑‍⚖️ Moderator Reputation</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Address</th>
            <th className="p-2">Approvals</th>
            <th className="p-2">Dismissals</th>
            <th className="p-2">Appeal Reversals</th>
            <th className="p-2">Net Trust</th>
          </tr>
        </thead>
        <tbody>
          {mods.map((mod) => (
            <tr key={mod.address} className="border-t">
              <td className="p-2 font-mono text-blue-700">{mod.address}</td>
              <td className="p-2 text-center">{mod.approvals}</td>
              <td className="p-2 text-center">{mod.dismissals}</td>
              <td className="p-2 text-center text-red-500">{mod.appealReversals}</td>
              <td className="p-2 text-center font-bold">{mod.netTrust}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
