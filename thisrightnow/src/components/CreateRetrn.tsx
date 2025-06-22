import { useState } from "react";
import { submitRetrn } from "@/utils/submitRetrn";

export default function CreateRetrn({
  parentHash,
  onRetrn,
}: {
  parentHash: string;
  onRetrn?: (data: any) => void;
}) {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async () => {
    if (!text || text.length < 3) {
      alert("Post too short.");
      return;
    }
    if (text.length > 1024) {
      alert("Post too long.");
      return;
    }

    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const hash = await submitRetrn(parentHash, text, tagArr);
      setText("");
      setTags("");
      if (onRetrn) {
        const data = {
          content: text,
          tags: tagArr,
          timestamp: Date.now(),
          hash,
        };
        onRetrn(data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit retrn.");
    }
  };

  return (
    <div className="border p-4 mb-4">
      <textarea
        className="w-full border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something..."
      />
      <input
        type="text"
        className="w-full border p-2 mt-2"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags: ai, memes, politics"
      />
      <button onClick={handleSubmit} className="mt-2">
        Submit Retrn
      </button>
    </div>
  );
}
