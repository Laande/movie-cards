import { NextResponse } from "next/server";
import { getDetails, getImageUrl, getProviders } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const mediaType = searchParams.get("mediaType") as "movie" | "tv" | null;
  const language = searchParams.get("lang") || "en-US";
  const region = searchParams.get("region") || "US";

  if (!id || !mediaType)
    return NextResponse.json({ error: "Missing id or mediaType" }, { status: 400 });

  try {
    const data = await getDetails(mediaType, Number(id), language);
    const providers = getProviders(data, region);

    const result: any = {
      id: data.id,
      title: data.title || data.name,
      overview: data.overview,
      posterUrl: getImageUrl(data.poster_path, "w500"),
      backdropUrl: getImageUrl(data.backdrop_path, "w780"),
      releaseDate: data.release_date || data.first_air_date,
      mediaType,
      providers,
    };

    if (mediaType === "movie") {
      result.runtime = data.runtime;
    } else {
      result.numberOfSeasons = data.number_of_seasons;
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
  }
}
