import { useState } from "react";
import { submitPost } from "@/utils/submitPost";

export default function CreatePost({
  onPosted,
}: {
  onPosted: (data: any) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [estEarnings, setEstEarnings] = useState<number | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    const hash = await submitPost(text);
    onPosted({ text, hash });
    setText("");
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // 🧠 Simple projection logic (replace with API call later)
    const words = value.trim().split(/\s+/).length;
    const retrnBoost = 1.2;
    const trustFactor = 1.5;
    const estimate = Math.min(words, 300) * 0.003 * retrnBoost * trustFactor;
    setEstEarnings(estimate);
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <textarea
        value={text}
        onChange={handleChange}
        rows={3}
        className="w-full border rounded p-2 text-sm"
        placeholder="What's on your mind?"
        disabled={loading}
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500">
          Estimated earnings: {estEarnings?.toFixed(3)} TRN
        </p>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-1 rounded"
          disabled={loading || !text.trim()}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
