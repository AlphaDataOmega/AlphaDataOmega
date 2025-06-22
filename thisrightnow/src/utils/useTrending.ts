import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTrending(category?: string) {
  const { data, error, isLoading } = useSWR(
    category ? `/api/trending?category=${category}` : `/api/trending`,
    fetcher,
    { refreshInterval: 60000 }
  );

  return {
    posts: data || [],
    isLoading,
    isError: !!error,
  };
}
