import { useState, useEffect, useCallback } from "react";
import { getReviews, postReview, getTMDBDetails, getTMDBDetailsByTitle } from "../api/api";
import "./MovieModal.css";

const FALLBACK = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";

/* ─── Star picker ────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`star-btn ${s <= (hover || value) ? "star-btn--on" : ""}`}
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

/* ─── Single review card ─────────────────── */
function ReviewCard({ review, onDelete }) {
  const content = review.content || "";
  const rating  = review.rating ?? null;
  const date    = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "";
  const name    = review.username || "Anonymous";
  const loggedUser = localStorage.getItem("username");

  return (
    <div className="review-card">
      <div className="review-card__head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="review-card__author" style={{ fontWeight: "bold", margin: "0 0 4px 0", color: "#fff" }}>{name}</p>
          {rating !== null && (
            <p className="review-card__stars">
              {"★".repeat(Number(rating))}
              {"☆".repeat(5 - Number(rating))}
            </p>
          )}
          {date && <p className="review-card__date">{date}</p>}
        </div>
          <button 
            type="button"
            title="Delete Review"
            onClick={() => onDelete(review.id)}
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
      </div>
      {content && <p className="review-card__text">{content}</p>}
    </div>
  );
}

/* ─── Main modal ─────────────────────────── */
export default function MovieModal({ movie, onClose }) {
  const [poster,      setPoster]      = useState(movie.injectedPoster || FALLBACK);
  const [tmdbRating,  setTmdbRating]  = useState(null);
  const [reviews,     setReviews]     = useState([]);
  const [loadingRev,  setLoadingRev]  = useState(true);
  const [form,        setForm]        = useState({ content: "", rating: 0 });
  const [submitting,  setSubmitting]  = useState(false);
  const [submitMsg,   setSubmitMsg]   = useState(null);

  /* poster logic */
  useEffect(() => {
    if (movie.injectedPoster) return; // Optimized: skip fetch if already pre-fetched

    const fetchPoster = async () => {
      try {
        let details = null;
        if (movie.tmdbId) {
          details = await getTMDBDetails(movie.tmdbId);
        }
        if (!details?.url && movie.title) {
          details = await getTMDBDetailsByTitle(movie.title);
        }
        if (details?.url) setPoster(details.url);
        if (details?.rating) setTmdbRating(details.rating);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPoster();
  }, [movie]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* fetch reviews */
  const fetchReviews = useCallback(async () => {
    setLoadingRev(true);
    try {
      const res = await getReviews(movie.id || movie.movieId);
      console.log(res.data);
      setReviews(res.data);
    } catch {
      setReviews([]);
    } finally {
      setLoadingRev(false);
    }
  }, [movie.id, movie.movieId]);

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
    if (!form.content.trim()) {
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
      await postReview({ content: form.content, rating: form.rating, movieId: Number(movie.id || movie.movieId) });
      setSubmitMsg({ type: "success", text: "Review posted! Thank you 🎉" });
      setForm({ content: "", rating: 0 });
      await fetchReviews();
    } catch {
      setSubmitMsg({ type: "error", text: "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const baseRating  = movie.computedRating ?? movie.avgRating ?? movie.averageRating ?? 0;
  const rating      = baseRating > 0 ? baseRating : (tmdbRating ? tmdbRating / 2 : null);
  const description = movie.description ?? movie.overview ?? movie.plot ?? null;
  const year        = movie.releaseYear ?? movie.year ?? null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal__bg" style={{ backgroundImage: `url(${poster})` }} />
        <div className="modal__bg-overlay" />

        <div className="modal__body">
          <div className="modal__top">
            <div className="modal__poster-wrap">
              <img src={poster} alt={movie.title} className="modal__poster" onError={(e) => { e.target.src = FALLBACK; }} />
            </div>

            <div className="modal__info">
              <h1 className="modal__title">{movie.title}</h1>
              <div className="modal__meta">
                {year   && <span className="modal__pill">{year}</span>}
                {rating !== null && (
                  <span className="modal__pill modal__pill--gold">
                    ★ {Number(rating).toFixed(1)} / 5
                  </span>
                )}
              </div>

              {description ? (
                <p className="modal__desc">{description}</p>
              ) : (
                <p className="modal__desc modal__desc--muted">No description available.</p>
              )}
            </div>
          </div>

          <div className="modal__reviews">
            <h2 className="modal__section-title">Reviews</h2>

            {loadingRev ? (
              <div className="modal__reviews-loading">Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <p className="modal__reviews-empty">No reviews yet.</p>
            ) : (
              <div className="modal__reviews-list">
                {reviews.map((r, i) => (
                  <ReviewCard key={r.id ?? i} review={r} onDelete={handleDeleteReview} />
                ))}
              </div>
            )}
          </div>

          <div className="modal__add-review">
            <h3 className="modal__section-title modal__section-title--sm">Write a Review</h3>
            <form className="add-form" onSubmit={handleSubmit}>
              <textarea
                className="add-form__textarea"
                placeholder="Share your thoughts about this film…"
                rows={3}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
              <div className="add-form__rating-row">
                <span className="add-form__rating-label">Your Rating</span>
                <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
              </div>
              {submitMsg && (
                <p className={`add-form__msg add-form__msg--${submitMsg.type}`}>
                  {submitMsg.text}
                </p>
              )}
              <button className="add-form__submit" type="submit" disabled={submitting}>
                {submitting ? "Posting…" : "Post Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}