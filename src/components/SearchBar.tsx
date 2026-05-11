"use client";

import { useState, useEffect, useRef } from "react";

interface SearchResult {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface Props {
  onSelect: (id: number, mediaType: "movie" | "tv") => void;
}

function userLang() {
  if (typeof navigator === "undefined") return "en-US";
  return navigator.language || "en-US";
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const skipNextRef = useRef(false);
  const langRef = useRef(userLang());

  useEffect(() => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const lang = langRef.current;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(r: SearchResult) {
    skipNextRef.current = true;
    setQuery(r.title || r.name || "");
    setOpen(false);
    setResults([]);
    onSelect(r.id, r.media_type);
  }

  return (
    <div ref={ref} className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Search movies & TV shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 focus:outline-none focus:border-indigo-500 text-base"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
          {results.map((r) => (
            <li
              key={`${r.media_type}-${r.id}`}
              onClick={() => select(r)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 cursor-pointer border-b border-zinc-700 last:border-0"
            >
              {r.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                  alt=""
                  className="w-10 h-14 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-14 rounded bg-zinc-700 flex items-center justify-center text-xs text-zinc-500">
                  N/A
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {r.title || r.name}
                </p>
                <p className="text-zinc-400 text-sm">
                  {r.media_type === "movie" ? "Movie" : "TV Series"}
                  {(r.release_date || r.first_air_date) &&
                    ` · ${(r.release_date || r.first_air_date)!.slice(0, 4)}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
