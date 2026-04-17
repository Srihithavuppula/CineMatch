import { useState, useEffect, useCallback } from "react";
import { getReviews, postReview, getTMDBDetailsByTitle } from "../api/api";
import "./MovieModal.css"; // Reuse exact same modal styles as homepage

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";

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
          aria-label={`${s} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ─── Main Modal Component ───────────────── */
export default function RecommendationModal({ movie, onClose }) {
  const [poster, setPoster] = useState(movie.posterUrl || movie.injectedPoster || FALLBACK_POSTER);
  const [reviews, setReviews] = useState([]);
  const [loadingRev, setLoadingRev] = useState(true);
  
  // Review form states
  const [formContent, setFormContent] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  const movieId = movie.movieId || movie.id;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Poster Fallback Logic
  useEffect(() => {
    if (!movie.posterUrl || movie.posterUrl.includes("w500[]")) {
      const fetchTMDB = async () => {
        try {
          const details = await getTMDBDetailsByTitle(movie.title);
          if (details && details.url) {
            setPoster(details.url);
          }
        } catch (err) {
          console.error(err);
        }
      };
      if (movie.title) fetchTMDB();
    }
  }, [movie]);

  // Fetch Reviews
  const fetchReviewsData = useCallback(async () => {
    setLoadingRev(true);
    try {
      const res = await getReviews(movieId);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoadingRev(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (movieId) fetchReviewsData();
  }, [movieId, fetchReviewsData]);

  // Submit Review
  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!formContent.trim()) {
      setSubmitMsg({ type: "error", text: "Please write a comment." });
      return;
    }
    if (formRating === 0) {
      setSubmitMsg({ type: "error", text: "Please select a star rating." });
      return;
    }

    setSubmitting(true);
    setSubmitMsg(null);
    try {
      await postReview({ 
        movieId: Number(movieId),
        rating: formRating, 
        content: formContent 
      });
      setSubmitMsg({ type: "success", text: "Review successfully posted!" });
      setFormContent("");
      setFormRating(0);
      await fetchReviewsData(); // refresh list
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setSubmitMsg({ type: "error", text: "Session expired. Please login." });
      } else {
        setSubmitMsg({ type: "error", text: "Failed to post review. Try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const description = movie.description || movie.overview || "No description available.";
  const ratingVal = movie.avgRating || movie.computedRating || 0;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal__bg" style={{ backgroundImage: `url(${poster})` }} />
        <div className="modal__bg-overlay" />

        <div className="modal__body">
          {/* Header Info */}
          <div className="modal__top">
            <div className="modal__poster-wrap">
              <img src={poster} alt={movie.title} className="modal__poster" onError={(e) => { e.target.src = FALLBACK_POSTER; }}/>
            </div>

            <div className="modal__info">
              <h1 className="modal__title">{movie.title}</h1>
              <div className="modal__meta">
                {ratingVal > 0 && (
                  <span className="modal__pill modal__pill--gold">
                    ★ {Number(ratingVal).toFixed(1)} / 5
                  </span>
                )}
              </div>
              <p className="modal__desc">{description}</p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="modal__reviews">
            <h2 className="modal__section-title">Reviews</h2>
            {loadingRev ? (
              <div className="modal__reviews-loading">Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <p className="modal__reviews-empty">Be the first to review this movie!</p>
            ) : (
              <div className="modal__reviews-list">
                {reviews.map((r, i) => (
                  <div key={r.id || i} className="review-card">
                    <div className="review-card__head">
                      <div>
                        <p className="review-card__author" style={{ fontWeight: 'bold', margin: '0 0 4px', color: '#fff' }}>
                          {r.username || "User"}
                        </p>
                        {r.rating !== undefined && r.rating !== null && (
                          <p className="review-card__stars">
                            {"★".repeat(Number(r.rating))}
                            {"☆".repeat(5 - Number(r.rating))}
                          </p>
                        )}
                      </div>
                    </div>
                    {r.content && <p className="review-card__text">{r.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="modal__add-review">
            <h3 className="modal__section-title modal__section-title--sm">Write a Review</h3>
            <form className="add-form" onSubmit={handlePostReview}>
              <textarea
                className="add-form__textarea"
                placeholder="What did you think of this movie?"
                rows={3}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
              <div className="add-form__rating-row">
                <span className="add-form__rating-label">Your Rating:</span>
                <StarPicker value={formRating} onChange={(v) => setFormRating(v)} />
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
