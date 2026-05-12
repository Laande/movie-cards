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

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

async function generateImage(el: HTMLElement): Promise<string> {
  return toPng(el, { quality: 1, pixelRatio: 3 });
}

export default function MovieCard({ data }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"save" | "copy" | "share" | null>(null);

  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy("save");
    try {
      const dataUrl = await generateImage(cardRef.current);
      const link = document.createElement("a");
      link.download = `${data.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }, [data.title]);

  const handleCopy = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy("copy");
    try {
      const dataUrl = await generateImage(cardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy("share");
    try {
      const dataUrl = await generateImage(cardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${data.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`, { type: "image/png" });
      await navigator.share({ files: [file], title: data.title });
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
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

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={busy === "save"}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center gap-1.5"
        >
          {busy === "save" ? <Spinner /> : "Save"}
        </button>
        <button
          onClick={handleCopy}
          disabled={busy === "copy"}
          className="px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center gap-1.5"
        >
          {busy === "copy" ? <Spinner /> : "Copy"}
        </button>
        <button
          onClick={handleShare}
          disabled={busy === "share"}
          className="px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center gap-1.5"
        >
          {busy === "share" ? <Spinner /> : "Share"}
        </button>
      </div>
    </div>
  );
}
