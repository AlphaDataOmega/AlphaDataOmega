import { useState } from 'react';

export default function PostCard({ post, user: _ }: any) {
  const [viewed, setViewed] = useState(false);
  const [blessed, setBlessed] = useState(false);
  const [burned, setBurned] = useState(false);

  const handleView = () => {
    // call ViewIndex.logView(post.hash)
    setViewed(true);
  };

  const handleBless = () => {
    // call BlessBurnTracker.blessPost(post.hash)
    setBlessed(true);
  };

  const handleBurn = () => {
    // call BlessBurnTracker.burnPost(post.hash)
    setBurned(true);
  };

  return (
    <div className="border p-4 mb-4">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <div className="mt-2">
        <button disabled={viewed} onClick={handleView}>👁️ View</button>
        <button disabled={blessed} onClick={handleBless}>🙏 Bless</button>
        <button disabled={burned} onClick={handleBurn}>🔥 Burn</button>
      </div>
    </div>
  );
}
