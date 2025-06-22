import { useState } from "react";
import { submitPost } from "@/utils/submitPost";
import { useVaultStatus } from "@/hooks/useVaultStatus";

export default function CreatePost() {
  const { initialized, unlocked } = useVaultStatus();
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");

  if (!initialized || !unlocked) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
        🔒 You must unlock your Vault to post.
        <br />
        Go to <a href="/vault" className="underline">Vault Setup</a>.
      </div>
    );
  }

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
      await submitPost(text, tagArr);
      setText("");
      setTags("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit post.");
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
        Submit
      </button>
    </div>
  );
}
