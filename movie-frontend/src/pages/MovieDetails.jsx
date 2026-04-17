import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovies, getReviews, postReview, getTMDBPoster, getTMDBPosterByTitle } from "../api/api";
import "./MovieDetails.css";

const FALLBACK =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";

/* ── Star picker ─────────────────────────── */
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`star ${s <= (hover || value) ? "star--active" : ""}`}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          aria-label={`${s} star${s !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ── Review card ─────────────────────────── */
function ReviewCard({ review, onDelete }) {
  const name    = review.username || "Anonymous";
  const text    = review.comment || review.content || review.text || "";
  const rating  = review.rating ?? null;
  const initials = name.slice(0, 2).toUpperCase();
  const loggedUser = localStorage.getItem("username");

  return (
    <div className="review-card">
      <div className="review-card__header">
        <span className="review-card__avatar">{initials}</span>
        <div>
          <p className="review-card__author">{name}</p>
          {rating !== null && (
            <p className="review-card__stars">
              {"★".repeat(Number(rating))}
              {"☆".repeat(5 - Number(rating))}
            </p>
          )}
        </div>
          <button 
            type="button"
            title="Delete Review"
            onClick={() => onDelete(review.id)}
            style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto", background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.3)", color: "#e94560", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </button>
      </div>
      {text && <p className="review-card__text">{text}</p>}
    </div>
  );
}

/* ── Main page ───────────────────────────── */
export default function MovieDetails() {
  const { id } = useParams();

  const [movie,      setMovie]      = useState(null);
  const [poster,     setPoster]     = useState(FALLBACK);
  const [pageState,  setPageState]  = useState("loading"); // loading | found | notfound
  const [reviews,    setReviews]    = useState([]);
  const [loadingRev, setLoadingRev] = useState(true);
  const [form,       setForm]       = useState({ reviewerName: "", comment: "", rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg,  setSubmitMsg]  = useState(null);

  /* fetch movie from /movies list (no individual endpoint assumed) */
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await getMovies();
        const list = Array.isArray(res.data) ? res.data : [];
        const found = list.find(
          (m) => String(m.id) === String(id)
        );
        if (!found) { setPageState("notfound"); return; }
        setMovie(found);
        setPoster(FALLBACK);
        setPageState("found");

        /* try TMDB poster exclusively */
        const fetchPoster = async () => {
          let url = null;
          if (found.tmdbId) {
            url = await getTMDBPoster(found.tmdbId);
          }
          if (!url && found.title) {
            url = await getTMDBPosterByTitle(found.title);
          }
          if (url) setPoster(url);
        };
        fetchPoster();
      } catch {
        setPageState("notfound");
      }
    };
    fetchMovie();
  }, [id]);

  /* fetch reviews */
  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setLoadingRev(true);
    try {
      const res = await getReviews(id);
      console.log(res.data);
      setReviews(res.data);
    } catch {
      setReviews([]);
    } finally {
      setLoadingRev(false);
    }
  }, [id]);

  const handleDeleteReview = async (reviewId) => {
    try {
      await import("../api/api").then(api => api.deleteReview(reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch(err) {
      alert("Failed to delete review. Ensure you are the author.");
    }
  };

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  /* submit review */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      setSubmitMsg({ type: "error", text: "Please write a review." });
      return;
    }
    if (form.rating === 0) {
      setSubmitMsg({ type: "error", text: "Please select a star rating." });
      return;
    }
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      await postReview({ ...form, movieId: Number(id) });
      setSubmitMsg({ type: "success", text: "Review posted! Thank you 🎉" });
      setForm({ reviewerName: "", comment: "", rating: 0 });
      await fetchReviews();
    } catch {
      setSubmitMsg({ type: "error", text: "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading state ── */
  if (pageState === "loading") {
    return (
      <div className="details-loading">
        <div className="details-spinner" />
        <p>Loading movie…</p>
      </div>
    );
  }

  /* ── Not found ── */
  if (pageState === "notfound" || !movie) {
    return (
      <div className="details-notfound">
        <h2>Movie not found</h2>
        <Link to="/" className="back-link">← Back to home</Link>
      </div>
    );
  }

  /* normalise fields */
  const rating      = movie.avgRating ?? movie.averageRating ?? movie.rating ?? null;
  const description = movie.description ?? movie.overview ?? movie.plot ?? null;
  const year        = movie.releaseYear ?? movie.year ?? movie.releaseDate?.slice(0, 4) ?? null;
  const genre       = movie.genre ?? movie.genres ?? null;

  const reviewAvg = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="details">
      {/* blurred bg */}
      <div className="details__backdrop" style={{ backgroundImage: `url(${poster})` }} />
      <div className="details__backdrop-overlay" />

      <div className="details__container">
        <Link to="/" className="back-link">← Back to Movies</Link>

        {/* ── Main info ── */}
        <div className="details__main">

          {/* Poster */}
          <div className="details__poster-wrap">
            <img
              src={poster}
              alt={movie.title}
              className="details__poster"
              onError={(e) => { e.target.src = FALLBACK; }}
            />
            {rating !== null && (
              <div className="details__rating-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5c518">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                {Number(rating).toFixed(1)}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="details__title">{movie.title}</h1>

            <div className="details__tags">
              {year  && <span className="details__tag">{year}</span>}
              {genre && <span className="details__tag">{genre}</span>}
              {rating !== null && (
                <span className="details__tag" style={{ color: "#f5c518", borderColor: "rgba(245,197,24,.25)", background: "rgba(245,197,24,.07)" }}>
                  ★ {Number(rating).toFixed(1)} / 5
                </span>
              )}
            </div>

            {description ? (
              <p className="details__desc">{description}</p>
            ) : (
              <p className="details__desc" style={{ color: "rgba(255,255,255,.3)", fontStyle: "italic" }}>
                No description available.
              </p>
            )}

            {reviewAvg && (
              <div className="details__community-rating">
                <span className="details__community-label">Community Rating</span>
                <span className="details__community-score">
                  {"★".repeat(Math.round(reviewAvg))}
                  {"☆".repeat(5 - Math.round(reviewAvg))}{" "}
                  <span>{reviewAvg} / 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="details__reviews">
          <h2 className="details__section-title">
            Reviews
            {reviews.length > 0 && (
              <span className="details__section-count">{reviews.length} total</span>
            )}
          </h2>

          {loadingRev ? (
            <p className="reviews-loading">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="reviews-empty">🎬 No reviews yet — be the first!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((r, i) => (
                <ReviewCard key={r.id ?? i} review={r} onDelete={handleDeleteReview} />
              ))}
            </div>
          )}

          {/* ── Add Review ── */}
          <div className="add-review">
            <h3 className="add-review__title">Write a Review</h3>
            <form className="add-review__form" onSubmit={handleSubmit}>
              <input
                className="add-review__input"
                type="text"
                placeholder="Your name (optional)"
                value={form.reviewerName}
                onChange={(e) => setForm((f) => ({ ...f, reviewerName: e.target.value }))}
              />
              <textarea
                className="add-review__textarea"
                placeholder="Share your thoughts about this film…"
                rows={4}
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              />
              <div className="add-review__rating-row">
                <span className="add-review__rating-label">Your Rating</span>
                <StarRating
                  value={form.rating}
                  onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                />
                {form.rating > 0 && (
                  <span className="add-review__rating-val">{form.rating} / 5</span>
                )}
              </div>
              {submitMsg && (
                <p className={`add-review__msg add-review__msg--${submitMsg.type}`}>
                  {submitMsg.text}
                </p>
              )}
              <button
                className="add-review__submit"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Posting…" : "Post Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}