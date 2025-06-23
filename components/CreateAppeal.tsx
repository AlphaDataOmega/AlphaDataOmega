import { useState } from "react";
import { submitAppeal } from "@/utils/moderation";

export default function CreateAppeal({ postHash, onSubmitted }: { postHash: string; onSubmitted: () => void }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitAppeal(postHash, reason);
      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      alert("Error submitting appeal");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <p className="text-green-600 mt-4">✅ Appeal submitted successfully.</p>;

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h3 className="font-bold mb-2">📢 Submit Appeal</h3>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        placeholder="Explain why this moderation decision was incorrect..."
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting || reason.length < 10}
        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Appeal"}
      </button>
    </div>
  );
}
