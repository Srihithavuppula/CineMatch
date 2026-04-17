import MovieCard from "./MovieCard";
import "./MovieList.css";

export default function MovieList({ movies, loading, error, onCardClick, favoriteIds = [], onToggleFavorite, onRecommend, title }) {
  if (loading) {
    return (
      <section className="mlist">
        {title && (
          <div className="mlist__header">
            <h2 className="mlist__heading">{title}</h2>
            <span className="mlist__line" />
          </div>
        )}
        <div className="mlist__grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="mlist__skeleton"
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mlist">
        <div className="mlist__state mlist__state--error">
          <span>⚠</span>
          <p>{error}</p>
          <small>
            Make sure your Spring Boot backend is running on{" "}
            <code>localhost:8080</code>
          </small>
        </div>
      </section>
    );
  }

  if (!movies?.length) {
    return (
      <section className="mlist">
        <div className="mlist__state">
          <span>🎬</span>
          <p>No movies found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mlist" id="movies-section">
      {title && (
        <div className="mlist__header">
          <h2 className="mlist__heading">{title}</h2>
          <span className="mlist__line" />
          <span className="mlist__count">{movies.length} titles</span>
        </div>
      )}
      <div className="mlist__grid">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            className="mlist__item"
            style={{ animationDelay: `${Math.min(i * 0.07, 0.55)}s` }}
          >
            <MovieCard 
              movie={movie} 
              onClick={onCardClick} 
              isFavorite={favoriteIds.includes(movie.id)}
              onToggleFavorite={onToggleFavorite}
              onRecommend={onRecommend}
            />
          </div>
        ))}
      </div>
    </section>
  );
}