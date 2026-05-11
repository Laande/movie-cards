"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface CardData {
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  mediaType: "movie" | "tv";
  runtime?: number;
  numberOfSeasons?: number;
  providers: Provider[];
}

interface Props {
  data: CardData;
}

export default function MovieCard({ data }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `${data.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [data.title]);

  const year = data.releaseDate?.slice(0, 4) || "";
  const infoParts: string[] = [
    data.mediaType === "movie" ? "Movie" : "TV Series",
  ];

  if (data.mediaType === "movie" && data.runtime) {
    const h = Math.floor(data.runtime / 60);
    const m = data.runtime % 60;
    infoParts.push(`${h}h${m > 0 ? m + "m" : ""}`);
  }
  if (data.mediaType === "tv" && data.numberOfSeasons != null) {
    infoParts.push(
      `${data.numberOfSeasons} season${data.numberOfSeasons > 1 ? "s" : ""}`
    );
  }
  if (year) infoParts.push(year);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div
        ref={cardRef}
        className="relative w-full overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-2xl"
        style={{
          aspectRatio: data.mediaType === "movie" ? 9 / 16 : 3 / 4,
          maxWidth: 360,
        }}
      >
        {data.posterUrl ? (
          <img
            src={data.posterUrl}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-500 text-lg">
            No poster
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-black/10" />

        <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
          <h2 className="text-xl font-bold leading-tight">{data.title}</h2>

          <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
            {data.overview}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {infoParts.map((part, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-zinc-200 font-medium"
              >
                {part}
              </span>
            ))}
          </div>

          {data.providers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[10px] text-zinc-400 font-medium mr-0.5">
                {data.mediaType === "movie"
                  ? "Streaming on ·"
                  : "Available on ·"}
              </span>
              {data.providers.slice(0, 5).map((p) => (
                <img
                  key={p.provider_id}
                  src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                  alt={p.provider_name}
                  title={p.provider_name}
                  className="w-6 h-6 rounded object-cover"
                  crossOrigin="anonymous"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-colors"
        >
          {saving ? "Generating..." : "Save as PNG"}
        </button>
      </div>
    </div>
  );
}
