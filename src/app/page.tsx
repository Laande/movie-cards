"use client";

import { useState, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";

interface CardData {
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  mediaType: "movie" | "tv";
  runtime?: number;
  numberOfSeasons?: number;
  providers: { provider_id: number; provider_name: string; logo_path: string }[];
}

export default function Home() {
  const [data, setData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const langRef = useRef(
    typeof navigator !== "undefined" ? navigator.language : "en-US"
  );
  const regionRef = useRef(
    typeof navigator !== "undefined"
      ? navigator.language.includes("-")
        ? navigator.language.split("-")[1].toUpperCase()
        : navigator.language.toUpperCase()
      : "US"
  );

  async function handleSelect(id: number, mediaType: "movie" | "tv") {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(
        `/api/details?id=${id}&mediaType=${mediaType}&lang=${langRef.current}&region=${regionRef.current}`
      );
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-8 flex-1">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-white">Movie Cards</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Create movie & TV show cards to share
        </p>
      </header>

      <SearchBar onSelect={handleSelect} />

      {loading && (
        <p className="text-zinc-400 text-sm mt-4">Loading...</p>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-4">{error}</p>
      )}
      {!loading && !data && !error && (
        <p className="text-zinc-500 text-sm mt-8 text-center">
          Search a movie or TV show to generate your card
        </p>
      )}

      {data && <MovieCard data={data} />}
    </div>
  );
}
