import { useState } from 'react';
import { ethers } from 'ethers';
import ViewIndexABI from '../abi/ViewIndex.json';
import BlessBurnTrackerABI from '../abi/BlessBurnTracker.json';

interface Post {
  hash: string;
  title: string;
  content: string;
}

const VIEW_INDEX_ADDR = '0xYourViewIndexAddress';
const BLESS_BURN_ADDR = '0xYourBlessBurnAddress';

export default function PostCard({ post, user }: { post: Post; user: string }) {
  const [viewed, setViewed] = useState(false);
  const [blessed, setBlessed] = useState(false);
  const [burned, setBurned] = useState(false);

  const handleView = async () => {
    if (!user || viewed) return;
    try {
      const provider = new ethers.BrowserProvider(
        (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VIEW_INDEX_ADDR, ViewIndexABI, signer);
      await contract.logView(post.hash);
      setViewed(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBless = async () => {
    if (!user || blessed) return;
    try {
      const provider = new ethers.BrowserProvider(
        (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(BLESS_BURN_ADDR, BlessBurnTrackerABI, signer);
      await contract.blessPost(post.hash);
      setBlessed(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBurn = async () => {
    if (!user || burned) return;
    try {
      const provider = new ethers.BrowserProvider(
        (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(BLESS_BURN_ADDR, BlessBurnTrackerABI, signer);
      await contract.burnPost(post.hash);
      setBurned(true);
    } catch (err) {
      console.error(err);
    }
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
