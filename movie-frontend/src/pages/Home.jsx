import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MovieList from "../components/MovieList";
import MovieModal from "../components/MovieModal";
import { getMovies, searchMovies, getTMDBDetails, getTMDBDetailsByTitle, getFavorites, addFavorite, removeFavorite } from "../api/api";
import "./Home.css";

const GENRES = [
  { id: 16, name: "Action" }, { id: 1, name: "Adventure" }, { id: 2, name: "Animation" },
  { id: 19, name: "Comedy" }, { id: 3, name: "Crime" }, { id: 4, name: "Documentary" },
  { id: 17, name: "Drama" }, { id: 5, name: "Family" }, { id: 6, name: "Fantasy" },
  { id: 20, name: "Foreign" }, { id: 7, name: "History" }, { id: 8, name: "Horror" },
  { id: 9, name: "Music" }, { id: 10, name: "Mystery" }, { id: 11, name: "Romance" },
  { id: 12, name: "Science Fiction" }, { id: 18, name: "Thriller" }, { id: 13, name: "TV Movie" },
  { id: 14, name: "War" }, { id: 15, name: "Western" }
];

export default function Home({ searchQuery }) {
  const navigate = useNavigate();
  const [completeCatalog, setCompleteCatalog] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(16); // Default to Action (ID: 16)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const enrichMovies = async (movies) => {
    return Promise.all(
      movies.map(async (m) => {
        let computedRating = m.avgRating ?? m.averageRating ?? 0;
        let injectedPoster = m.injectedPoster || null;
        let description = m.description ?? m.overview ?? m.plot ?? null;
        let releaseYear = m.releaseYear ?? m.year ?? null;

        if (computedRating === 0 || !injectedPoster || !description || !releaseYear) {
          try {
            const details = m.tmdbId 
              ? await getTMDBDetails(m.tmdbId) 
              : await getTMDBDetailsByTitle(m.title);
            
            if (details) {
              if (computedRating === 0 && details.rating) computedRating = details.rating / 2;
              if (!injectedPoster && details.url) injectedPoster = details.url;
              if (!description && details.overview) description = details.overview;
              if (!releaseYear && details.releaseDate) releaseYear = details.releaseDate.split('-')[0];
            }
          } catch (e) {}
        }
        return { ...m, computedRating, injectedPoster, description, releaseYear };
      })
    );
  };

  /* initial fetch */
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMovies();
        const raw = Array.isArray(res.data) ? res.data : [];

        // Pre-fetch TMDB ratings to accurately sort 'Top 10' when backend avgRating is 0.0
        const ratedMovies = await enrichMovies(raw);

        // Sort by computedRating (descending)
        const sorted = ratedMovies.sort((a, b) => b.computedRating - a.computedRating);
        setCompleteCatalog(sorted);
        
        // Apply default Action genre filter initially
        const actionFiltered = sorted.filter(m => m.genres?.some(g => g.id === 16));
        setDisplayed(actionFiltered.slice(0, 10));
      } catch (err) {
        console.error(err);
        setError("Could not load movies. Is your Spring Boot backend running on port 8080?");
      } finally {
        setLoading(false);
      }
    };

    const fetchFavs = async () => {
      if (!localStorage.getItem("token")) return;
      try {
        const res = await getFavorites();
        if (Array.isArray(res.data)) {
          const ids = res.data.map(item => (typeof item === 'object' ? item.id : item));
          setFavoriteIds(ids);
        }
      } catch (err) {}
    };

    fetchMovies();
    fetchFavs();
  }, []);

  /* search */
  useEffect(() => {
    if (!searchQuery?.trim()) {
      if (selectedGenre) {
        const filtered = completeCatalog.filter(m => m.genres?.some(g => g.id === selectedGenre));
        setDisplayed(filtered.slice(0, 10));
      } else {
        setDisplayed(completeCatalog.slice(0, 10));
      }
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const res = await searchMovies(searchQuery.trim());
        const allMatches = Array.isArray(res.data) ? res.data : [];
        const strictMatches = allMatches.filter(m => 
          m.title?.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
        const enriched = await enrichMovies(strictMatches);
        setDisplayed(enriched);
      } catch {
        setDisplayed([]);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [searchQuery, completeCatalog]);

  /* genre behavior */
  const handleGenreClick = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      setDisplayed(completeCatalog.slice(0, 10));
    } else {
      setSelectedGenre(genreId);
      const filtered = completeCatalog.filter(m => 
        m.genres?.some(g => g.id === genreId)
      );
      setDisplayed(filtered.slice(0, 10));
    }
  };

  const handleToggleFavorite = async (movie) => {
    if (!localStorage.getItem("token")) {
      alert("Please log in to manage favorites");
      return;
    }
    const isFav = favoriteIds.includes(movie.id);

    // Optimistic update
    setFavoriteIds(prev => isFav ? prev.filter(id => id !== movie.id) : [...prev, movie.id]);

    try {
      if (isFav) {
        await removeFavorite(movie.id);
      } else {
        await addFavorite(movie.id);
      }
    } catch (err) {
      // Revert on failure
      setFavoriteIds(prev => isFav ? [...prev, movie.id] : prev.filter(id => id !== movie.id));
    }
  };

  const featured = selectedGenre 
    ? completeCatalog.find(m => m.genres?.some(g => g.id === selectedGenre)) ?? completeCatalog[0]
    : completeCatalog[0] ?? null;

  return (
    <main className="home">
      {!searchQuery && <Hero featuredMovie={featured} />}
      {!searchQuery && (
        <div className="home__genres">
          {GENRES.map((g) => (
             <button 
               key={g.id} 
               className={`genre-btn ${selectedGenre === g.id ? 'active' : ''}`}
               onClick={() => handleGenreClick(g.id)}
             >
               {g.name}
             </button>
          ))}
        </div>
      )}
      <MovieList
        movies={displayed}
        loading={loading}
        error={error}
        onCardClick={setSelected}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        onRecommend={(m) => navigate("/recommendations", { state: { recommendMovieId: m.id || m.movieId, recommendMovieTitle: m.title } })}
        title={searchQuery ? "Search Results" : "Top 10 Movies"}
      />
      {selected && (
        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}