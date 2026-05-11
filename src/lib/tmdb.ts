const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";

export async function searchMulti(query: string, language = "en-US") {
  const res = await fetch(
    `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&language=${language}`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  );
  if (!res.ok) throw new Error("TMDB search failed");
  const data = await res.json();
  return data.results.filter(
    (r: any) => r.media_type === "movie" || r.media_type === "tv"
  );
}

export async function getDetails(
  mediaType: "movie" | "tv",
  id: number,
  language = "en-US"
) {
  const res = await fetch(
    `${TMDB_BASE}/${mediaType}/${id}?append_to_response=watch/providers&language=${language}`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  );
  if (!res.ok) throw new Error("TMDB details failed");
  return res.json();
}

export function getImageUrl(path: string | null, size = "w500") {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export function getProviders(data: any, region = "US") {
  const providers =
    data["watch/providers"]?.results?.[region] ??
    data["watch/providers"]?.results?.US;
  if (!providers) return [];
  const all = [
    ...(providers.flatrate ?? []),
    ...(providers.ads ?? []),
    ...(providers.buy ?? []),
    ...(providers.rent ?? []),
  ];
  return Array.from(new Map(all.map((p: any) => [p.provider_id, p])).values());
}
