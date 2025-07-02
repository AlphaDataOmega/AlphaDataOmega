import { useAccount } from "wagmi";
import { useState } from "react";

export default function SettingsPage() {
  const { address } = useAccount();

  const [settings, setSettings] = useState({
    autoClaim: true,
    showTrustScores: true,
    enableNotifications: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    console.log(`Toggled ${key} to`, !settings[key]);
    // TODO: Persist setting via on-chain tx or localStorage
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>

      {address ? (
        <p className="mb-6 text-gray-600">Connected wallet: <span className="font-mono">{address}</span></p>
      ) : (
        <p className="mb-6 text-red-500">Please connect your wallet to configure settings.</p>
      )}

      <div className="space-y-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center border-b pb-2">
            <label htmlFor={key} className="capitalize text-lg">{key.replace(/([A-Z])/g, ' $1')}</label>
            <button
              onClick={() => toggle(key as keyof typeof settings)}
              className={`px-4 py-1 rounded ${value ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-800'}`}
            >
              {value ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
