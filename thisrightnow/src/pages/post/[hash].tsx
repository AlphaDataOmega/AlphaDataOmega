import { useRouter } from "next/router";
import PostEarnings from "@/components/PostEarnings";

export default function PostPage() {
  const router = useRouter();
  const { hash } = router.query;

  if (!hash || typeof hash !== "string") return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Post {hash}</h1>
      {/* Post content would go here */}
      <PostEarnings postHash={hash as string} />
      <div className="mt-4">
        <h2 className="font-semibold">🔁 Retrns</h2>
        {/* retrns list placeholder */}
      </div>
    </div>
  );
}
