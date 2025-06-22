import { ConnectButton } from '@rainbow-me/rainbowkit';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import mockPosts from '../../public/mockPosts.json';

export default function Home() {

  return (
    <div className="p-4">
      <h1>ThisRightNow</h1>
      <ConnectButton />
      <div className="mt-4">
        <CreatePost />
      </div>
      <div className="mt-6">
        {mockPosts.map((post) => (
          <PostCard key={post.ipfsHash} ipfsHash={post.ipfsHash} />
        ))}
      </div>
    </div>
  );
}
