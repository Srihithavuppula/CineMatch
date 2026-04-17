import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  searchMoviesForRec,
  getSimilarMovies,
  getUserRecommendations,
  addFavorite,
  getFavorites,
  getTMDBDetailsByTitle,
  getTMDBDetails
} from "../api/api";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import "./recommendation.css";

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=50&q=80";

export default function RecommendationPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [moviesGrid, setMoviesGrid] = useState([]);
  const [gridTitle, setGridTitle] = useState("Your Personalized Recommendations");
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");

  const [favorites, setFavorites] = useState(new Set());
  const [selectedMovie, setSelectedMovie] = useState(null); // Added for MovieModal

  const searchRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.recommendMovieId) {
      handleFetchSimilar(location.state.recommendMovieId, location.state.recommendMovieTitle);
    } else {
      fetchPersonalized();
    }
    fetchFavoritesList();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shared generic movie enrichment matching Home.jsx logic deeply to fetch posters & ratings
  const enrichMovies = async (movies) => {
    return Promise.all(
      movies.map(async (m) => {
        let computedRating = m.avgRating ?? m.averageRating ?? 0;
        let injectedPoster = null; // Ignore backend posterUrl completely to force TMDB check

        if (computedRating === 0 || !injectedPoster) {
          try {
            const details = m.tmdbId
              ? await getTMDBDetails(m.tmdbId)
              : await getTMDBDetailsByTitle(m.title);

            if (details) {
              if (computedRating === 0 && details.rating) computedRating = details.rating / 2;
              if (details.url) injectedPoster = details.url;
            }
          } catch (e) {
            console.error("TMDB fetch fail for enrichment", e);
          }
        }
        return { ...m, computedRating, injectedPoster };
      })
    );
  };

  // Live Search Dropdown implementation
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const liveSearch = async () => {
      setIsSearching(true);
      try {
        const res = await searchMoviesForRec(query);
        const data = Array.isArray(res.data) ? res.data : [];
        const enriched = await enrichMovies(data.slice(0, 5));

        // Map to dropdownThumb format expected locally
        const formatForDropdown = enriched.map(m => ({
          ...m,
          dropdownThumb: m.injectedPoster || FALLBACK_POSTER
        }));

        setSearchResults(formatForDropdown);
        setShowDropdown(true);
      } catch (err) {
        console.error("Live search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(liveSearch, 400);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Load user favorites
  const fetchFavoritesList = async () => {
    try {
      const res = await getFavorites();
      const favIds = new Set(res.data.map(f => f.movieId || f.id));
      setFavorites(favIds);
    } catch (err) {
      console.error("Could not fetch favorites", err);
    }
  };

  const fetchPersonalized = async () => {
    setLoadingGrid(true);
    setErrorStatus("");
    setMoviesGrid([]);
    setGridTitle("Your Personalized Recommendations");

    try {
      const res = await getUserRecommendations();
      const data = res.data && res.data.length > 0 ? res.data : [];
      if (data.length === 0) {
        setErrorStatus("No personalized recommendations available yet.");
      } else {
        const enrichedData = await enrichMovies(data);
        setMoviesGrid(enrichedData);
      }
    } catch (err) {
      handleApiError(err, "Failed to load personalized recommendations.");
    } finally {
      setLoadingGrid(false);
    }
  };

  const handleFetchSimilar = async (movieId, movieTitleForGrid) => {
    setLoadingGrid(true);
    setErrorStatus("");
    setMoviesGrid([]);
    setShowDropdown(false);
    setQuery("");

    if (movieTitleForGrid) {
      setGridTitle(`Because you selected "${movieTitleForGrid}"`);
    } else {
      setGridTitle("Similar Recommendations");
    }

    try {
      const res = await getSimilarMovies(movieId);
      const data = res.data && res.data.length > 0 ? res.data : [];
      if (data.length === 0) {
        setErrorStatus("We couldn't find any similar recommendations for this title.");
      } else {
        const enrichedData = await enrichMovies(data);
        setMoviesGrid(enrichedData);
      }
    } catch (err) {
      handleApiError(err, "Failed to load similar movies.");
    } finally {
      setLoadingGrid(false);
    }
  };

  const handleToggleFavorite = async (movie) => {
    const movieId = movie.movieId || movie.id;
    try {
      if (favorites.has(movieId)) {
        // UI assumes clicking filled heart shouldn't crash. If the back-end errors out on duplicated, 
        // we handle it. Given standard logic of toggle, you must implement logic to remove favorite via the API as well.
      } else {
        await addFavorite(movieId);
        setFavorites(prev => {
          const next = new Set(prev);
          next.add(movieId);
          return next;
        });
      }
    } catch (err) {
      handleApiError(err, "Failed to add favorite. Ensure you are logged in.");
    }
  };

  const handleApiError = (err, defaultMsg) => {
    console.error(err);
    if (err.response?.status === 403) {
      setErrorStatus("Session expired or missing JWT. Please login.");
    } else {
      setErrorStatus(defaultMsg);
    }
  };

  return (
    <div className="netflix-dashboard">
      <main className="netflix-container">

        <header className="netflix-header">
          <div className="netflix-header-titles">
            <h1>Get your <span style={{ color: "#e94560" }}>perfect</span> movie match!!</h1>
          </div>
          <button
            className="btn-accent btn-magic"
            onClick={fetchPersonalized}
            disabled={loadingGrid}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            Get Personalized Recommendations
          </button>
        </header>

        {errorStatus && (
          <div className="status-msg error">{errorStatus}</div>
        )}

        <section className="search-section" ref={searchRef}>
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="Search for a movie title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (query && searchResults.length > 0) setShowDropdown(true); }}
              className="search-input"
            />
            {query && (
              <button type="button" className="search-clear-btn" onClick={() => { setQuery(""); setShowDropdown(false); }}>
                ✕
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="dropdown-results">
              {isSearching && searchResults.length === 0 ? (
                <div className="dropdown-loading">Searching dimensions...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(m => {
                  const mId = m.movieId || m.id;
                  return (
                    <div
                      key={mId}
                      className="dropdown-item"
                      onClick={() => handleFetchSimilar(mId, m.title)}
                    >
                      <img src={m.dropdownThumb} alt={m.title} className="dropdown-poster" />
                      <div className="dropdown-info">
                        <span className="dropdown-title">{m.title}</span>
                        {m.releaseYear && <span className="dropdown-year">{m.releaseYear}</span>}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="dropdown-loading">No results found for "{query}"</div>
              )}
            </div>
          )}
        </section>

        <section className="results-section">
          <h3>{gridTitle}</h3>

          {loadingGrid ? (
            <div className="status-msg">Loading universe...</div>
          ) : (
            <div className="movie-grid">
              {moviesGrid.map((movie) => {
                const k = movie.movieId || movie.id;
                return (
                  <MovieCard
                    key={k}
                    movie={movie}
                    isFavorite={favorites.has(k)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={(mov) => setSelectedMovie(mov)} // Open modal exactly like Home page
                    onRecommend={(mov) => handleFetchSimilar(mov.movieId || mov.id, mov.title)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Renders the EXACT same modal as Home Page restoring description matching layout! */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}