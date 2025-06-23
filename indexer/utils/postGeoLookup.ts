import geoMap from "../../src/data/post-geo.json";

export async function getGeoDataForPost(hash: string): Promise<string | null> {
  return (geoMap as Record<string, string>)[hash] || null;
}
