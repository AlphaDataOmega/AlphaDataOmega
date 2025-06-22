import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTrending(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const { data, error, isLoading } = useSWR(
    `/api/trending${query}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  return {
    posts: data || [],
    isLoading,
    isError: !!error,
  };
}
