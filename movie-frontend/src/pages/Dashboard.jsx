import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { getFavorites, getUserReviews, addFavorite, removeFavorite, getTMDBDetails, getTMDBDetailsByTitle, deleteReview } from "../api/api";
import MovieList from "../components/MovieList";
import MovieModal from "../components/MovieModal";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "User";

  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [activeTab, setActiveTab] = useState("favorites");
  const [selectedMovie, setSelectedMovie] = useState(null);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchDashData = async () => {
      try {
        const favRes = await getFavorites();
        const rawFavorites = Array.isArray(favRes.data) ? favRes.data : [];
        
        const enrichMovies = async (movies) => {
          return Promise.all(
            movies.map(async (m) => {
              let computedRating = m.avgRating ?? m.averageRating ?? 0;
              let injectedPoster = m.injectedPoster || null;

              if (computedRating === 0 || !injectedPoster) {
                try {
                  const details = m.tmdbId 
                    ? await getTMDBDetails(m.tmdbId) 
                    : await getTMDBDetailsByTitle(m.title);
                  
                  if (details) {
                    if (computedRating === 0 && details.rating) computedRating = details.rating / 2;
                    if (!injectedPoster && details.url) injectedPoster = details.url;
                  }
                } catch (e) {}
              }
              return { ...m, computedRating, injectedPoster };
            })
          );
        };

        const enrichedFavorites = await enrichMovies(rawFavorites);
        setFavorites(enrichedFavorites);
      } catch (err) {
        console.error("Failed to load favorites", err);
      } finally {
        setLoadingFavorites(false);
      }

      try {
        const revRes = await getUserReviews();
        setReviews(Array.isArray(revRes.data) ? revRes.data : []);
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };

    fetchDashData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const favoriteIds = favorites.map(f => typeof f === 'object' ? f.id : f);

  const handleToggleFavorite = async (movie) => {
    const isFav = favoriteIds.includes(movie.id);

    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== movie.id));
      try {
        await removeFavorite(movie.id);
      } catch (err) {
        setFavorites(prev => [...prev, movie]);
      }
    } else {
      setFavorites(prev => [...prev, movie]);
      try {
        await addFavorite(movie.id);
      } catch (err) {
        setFavorites(prev => prev.filter(f => f.id !== movie.id));
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch(err) {
      alert("Failed to delete review. Ensure you are the author.");
    }
  };

  return (
    <div className="dash-page">
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-title">Welcome, {username}!</h1>
            <p className="dash-subtitle">Manage your personal recommendations and activities.</p>
          </div>
          <button className="dash-logout" onClick={handleLogout}>Log Out</button>
        </header>

        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            My Favorites
          </button>
          <button
            className={`dash-tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            My Reviews
          </button>
        </div>

        <div className="dash-content">
          {activeTab === "favorites" && (
            <MovieList
              movies={favorites}
              loading={loadingFavorites}
              error={null}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onCardClick={setSelectedMovie}
              onRecommend={(m) => navigate("/recommendations", { state: { recommendMovieId: m.id || m.movieId, recommendMovieTitle: m.title } })}
            />
          )}

          {activeTab === "reviews" && (
            <div className="dash-reviews">
              {reviews.length === 0 ? (
                <div className="dash-empty">You haven't written any reviews yet.</div>
              ) : (
                <ul className="review-list">
                  {reviews.map((r) => (
                    <li key={r.id} className="review-card">
                      <div className="review-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <strong style={{ fontSize: "1.1rem" }}>{r.movieTitle || "Movie"}</strong>
                          <div className="review-rating" aria-label={`Rated ${r.rating} out of 5`}>
                            {"★".repeat(Number(r.rating || 0))}
                            <span style={{ color: "rgba(255,255,255,0.2)" }}>
                              {"★".repeat(5 - Number(r.rating || 0))}
                            </span>
                          </div>
                        </div>
                        {r.username === username && (
                          <button 
                            type="button"
                            title="Delete Review"
                            onClick={() => handleDeleteReview(r.id)}
                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.3)", color: "#e94560", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: "0.85em", color: "#ccc", marginBottom: "8px" }}>
                        By {r.username || "Anonymous"}
                      </div>
                      <p className="review-text">"{r.content}"</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  );
}
