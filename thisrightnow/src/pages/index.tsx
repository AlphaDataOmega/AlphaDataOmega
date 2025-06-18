import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import PostCard from '../components/PostCard';
import mockPosts from '../../public/mockPosts.json';

export default function Home() {
  const { address } = useAccount();

  return (
    <div className="p-4">
      <h1>ThisRightNow</h1>
      <ConnectButton />
      <div className="mt-6">
        {mockPosts.map((post) => (
          <PostCard key={post.hash} post={post} user={address ?? ''} />
        ))}
      </div>
    </div>
  );
}
