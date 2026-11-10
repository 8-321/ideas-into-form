export function FilmArtwork({
  src,
  alt,
  portrait = false,
  loading = "lazy",
  className = "",
}: {
  src: string;
  alt: string;
  portrait?: boolean;
  loading?: "eager" | "lazy";
  className?: string;
}) {
  return (
    <span className={`film-artwork${portrait ? " is-portrait" : ""}${className ? ` ${className}` : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="film-artwork__field" src={src} alt="" aria-hidden="true" loading={loading} decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="film-artwork__image" src={src} alt={alt} loading={loading} decoding="async" />
    </span>
  );
}
