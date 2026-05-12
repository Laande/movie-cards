export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-zinc-500">
      <span>
        Powered by{" "}
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          TMDB
        </a>
      </span>
      <span className="text-zinc-700">-</span>
      <a
        href="https://github.com/Laande/movie-cards"
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-400 hover:text-white transition-colors"
      >
        Source code
      </a>
    </footer>
  );
}
