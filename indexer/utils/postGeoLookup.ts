import geoMap from "../../src/data/post-geo.json";
import categoryMap from "../../src/data/post-category.json";

export async function getGeoDataForPost(hash: string): Promise<string | null> {
  return (geoMap as Record<string, string>)[hash] || null;
}

export async function getCategoryForPost(hash: string): Promise<string | null> {
  return (categoryMap as Record<string, string>)[hash] || null;
}
