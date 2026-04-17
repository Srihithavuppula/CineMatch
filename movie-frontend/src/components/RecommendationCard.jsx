import { useState, useEffect } from "react";
import { getTMDBDetailsByTitle } from "../api/api";
import "../pages/recommendation.css"; // Ensure it gets styled

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";

export default function RecommendationCard({ movie, onRecommend, onFavorite, isFavorite, onClick }) {
  const [poster, setPoster] = useState(movie.posterUrl || movie.injectedPoster || FALLBACK_POSTER);

  useEffect(() => {
    // If we have an obviously invalid poster or no poster, fallback to TMDB
    if (!movie.posterUrl || movie.posterUrl.includes("w500[]")) {
      const fetchTMDB = async () => {
        try {
          const details = await getTMDBDetailsByTitle(movie.title);
          if (details && details.url) {
            setPoster(details.url);
          } else {
            setPoster(FALLBACK_POSTER);
          }
        } catch (err) {
          setPoster(FALLBACK_POSTER);
        }
      };
      
      if (movie.title) {
        fetchTMDB();
      }
    }
  }, [movie]);

  return (
    <article className="recon-card" onClick={() => onClick && onClick(movie)}>
      <div className="recon-poster-wrap">
        <img 
          src={poster} 
          alt={movie.title || "Movie Poster"} 
          className="recon-poster"
          onError={(e) => { e.target.src = FALLBACK_POSTER; }}
        />
        
        <h4 className="recon-title">{movie.title || "Unknown Title"}</h4>
        
        {/* Hover overlay per requirements */}
        <div className="recon-overlay" onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn-recommend"
            onClick={(e) => {
              e.stopPropagation();
              onRecommend && onRecommend(movie.movieId || movie.id);
            }}
          >
            Recommend
          </button>
          
          <button 
            className={`btn-favorite ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite && onFavorite(movie.movieId || movie.id);
            }}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            ❤️
          </button>
        </div>
      </div>
    </article>
  );
}
