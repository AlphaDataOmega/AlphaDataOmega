import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTrending(category?: string) {
  const { data, error, isLoading } = useSWR(
    "/indexer/output/trending.json",
    fetcher,
    { refreshInterval: 60000 }
  );

  let posts = (data as any[]) || [];
  if (category) {
    const cat = category.toLowerCase();
    posts = posts.filter((p) => p.category?.toLowerCase() === cat);
  }

  return {
    posts,
    isLoading,
    isError: !!error,
  };
}
