import axios from "axios";

const BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      console.error("403 Forbidden: JWT missing or expired.");
      localStorage.removeItem("token");
      // Optional: redirect to login if JWT is invalid
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

/* ── Backend Routes ──────────────────────── */
export const getMovies = () => api.get("/movies");
export const searchMovies = (title) => api.get(`/movies/search?title=${encodeURIComponent(title)}`);
export const getReviews = (movieId) => api.get(`/reviews/movie/${movieId}`);
export const postReview = (review) => api.post("/reviews", review);

const tmdbCache = new Map();

export const getTMDBDetails = (tmdbId) => {
  if (!tmdbId) return Promise.resolve(null);
  const cacheKey = `id_${tmdbId}`;
  if (tmdbCache.has(cacheKey)) return tmdbCache.get(cacheKey);

  const promise = axios.get(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`)
    .then(res => {
      return {
        url: res.data?.poster_path ? TMDB_IMG + res.data.poster_path : null,
        rating: res.data?.vote_average || null,
        overview: res.data?.overview || null,
        releaseDate: res.data?.release_date || null
      };
    })
    .catch(err => null);

  tmdbCache.set(cacheKey, promise);
  return promise;
};

export const getTMDBDetailsByTitle = (title) => {
  if (!title) return Promise.resolve(null);
  const cacheKey = `title_${title.toLowerCase()}`;
  if (tmdbCache.has(cacheKey)) return tmdbCache.get(cacheKey);

  const promise = axios.get(
    `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
  )
    .then(res => {
      const movie = res.data?.results?.[0];
      return {
        url: movie?.poster_path ? TMDB_IMG + movie.poster_path : null,
        rating: movie?.vote_average || null,
        overview: movie?.overview || null,
        releaseDate: movie?.release_date || null
      };
    })
    .catch(err => null);

  tmdbCache.set(cacheKey, promise);
  return promise;
};

/* ── Auth & User Routes ───────────────────── */
export const loginAPI = (credentials) => api.post("/auth/login", credentials);
export const registerAPI = (credentials) => api.post("/auth/register", credentials);

export const getUserReviews = () => api.get("/reviews/user");
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const getFavorites = () => api.get("/favorites");
export const addFavorite = (movieId) => api.post(`/favorites/${movieId}`);
export const removeFavorite = (movieId) => api.delete(`/favorites/${movieId}`);

/* ── Recommendations ──────────────────────── */
export const searchMoviesForRec = (query) => api.get(`/movies/search?title=${encodeURIComponent(query)}`);
export const getSimilarMovies = (movieId) => api.get(`/recommendations/movie/${movieId}`);
export const getUserRecommendations = () => api.get(`/recommendations/user`);
export default api;