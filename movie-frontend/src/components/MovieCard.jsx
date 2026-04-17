import "./MovieCard.css";

const FALLBACK = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";

export default function MovieCard({ movie, onClick, isFavorite, onToggleFavorite, onRecommend }) {
  if (!movie) return null;

  const poster = movie.injectedPoster || FALLBACK;
  const rating = movie.computedRating > 0 ? movie.computedRating : null;
  
  const getLanguageName = (code) => {
    if (!code) return "";
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
      return displayNames.of(code.toLowerCase());
    } catch {
      return code.toUpperCase();
    }
  };

  return (
    <article
      className="mcard"
      tabIndex={0}
      role="button"
      onClick={() => onClick && onClick(movie)}
      onKeyDown={(e) => e.key === "Enter" && onClick && onClick(movie)}
    >
      <div className="mcard__img-wrap">
        <img
          src={poster}
          alt={movie.title || "Movie"}
          className="mcard__img"
          loading="lazy"
          onError={(e) => (e.target.src = FALLBACK)}
        />
        
        <button 
          className={`mcard__heart ${isFavorite ? "mcard__heart--active" : ""}`}
          onClick={(e) => {
             e.stopPropagation();
             onToggleFavorite && onToggleFavorite(movie);
          }}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg 
            width="20" height="20" viewBox="0 0 24 24" 
            fill={isFavorite ? "#e94560" : "none"} 
            stroke={isFavorite ? "#e94560" : "#fff"} 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "all 0.3s ease" }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {movie.language && (
          <span className="mcard__lang-badge">{getLanguageName(movie.language)}</span>
        )}

        <div className="mcard__overlay">
          <div className="mcard__overlay-inner">
            <span className="mcard__play">▶</span>
            <h3 className="mcard__overlay-title">{movie.title || "Untitled"}</h3>
            {rating !== null && (
              <span className="mcard__overlay-rating">
                ⭐ {Number(rating).toFixed(1)}
              </span>
            )}
            <span className="mcard__overlay-cta">Click to explore</span>
          </div>
        </div>
      </div>

      <div className="mcard__footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "8px" }}>
          <p className="mcard__title">{movie.title || "Untitled"}</p>
          {rating !== null && (
            <span className="mcard__rating">
              ⭐ {Number(rating).toFixed(1)}
            </span>
          )}
        </div>
        
        {onRecommend && (
          <button 
            className="mcard__recommend-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRecommend(movie);
            }}
          >
            Recommend
          </button>
        )}
      </div>
    </article>
  );
}