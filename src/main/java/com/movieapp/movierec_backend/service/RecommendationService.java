package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.dto.RecommendationDTO;
import com.movieapp.movierec_backend.model.Favorite;
import com.movieapp.movierec_backend.model.Movie;
import com.movieapp.movierec_backend.model.Review;
import com.movieapp.movierec_backend.model.User;
import com.movieapp.movierec_backend.repository.FavoriteRepository;
import com.movieapp.movierec_backend.repository.ReviewRepository;
import com.movieapp.movierec_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RecommendationService {

    private static final int MIN_RATING_THRESHOLD = 4;
    private static final int TOP_N = 10;

    private final ContentBasedFilterService contentService;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public RecommendationService(ContentBasedFilterService contentService,
                                 FavoriteRepository favoriteRepository,
                                 ReviewRepository reviewRepository,
                                 UserRepository userRepository) {
        this.contentService = contentService;
        this.favoriteRepository = favoriteRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    // 🔥 PERSONALIZED USING USERNAME (JWT)
    public List<RecommendationDTO> getRecommendationsForUser(String username) {

        // ✅ Fetch user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        // ── Step 1: collect seed movies ──────────────────────────
        Set<Movie> seedMovies = new HashSet<>();
        Set<Long> seenMovieIds = new HashSet<>();

        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        for (Favorite fav : favorites) {
            Movie m = fav.getMovie();
            if (m != null) {
                seedMovies.add(m);
                seenMovieIds.add(m.getId());
            }
        }

        List<Review> reviews = reviewRepository.findByUserId(userId);
        for (Review review : reviews) {
            Movie m = review.getMovie();
            if (m != null) {
                seenMovieIds.add(m.getId());
                if (review.getRating() >= MIN_RATING_THRESHOLD) {
                    seedMovies.add(m);
                }
            }
        }

        // ── Step 2: fallback ─────────────────────────────────────
        if (seedMovies.isEmpty()) {
            return contentService.getTopContentBasedMovies().stream()
                    .map(m -> mapToDTO(m, m.getPopularity()))
                    .limit(TOP_N)
                    .toList();
        }

        // ── Step 3: similarity aggregation ───────────────────────
        Map<Long, Double> scoreById = new HashMap<>();
        Map<Long, Movie> movieById = new HashMap<>();

        for (Movie seed : seedMovies) {

            List<ContentBasedFilterService.MovieScore> similar =
                    contentService.getSimilarMovies(seed.getId());

            for (ContentBasedFilterService.MovieScore ms : similar) {

                Movie rec = ms.getMovie();
                if (rec == null) continue;

                // ❌ skip already seen
                if (seenMovieIds.contains(rec.getId())) continue;

                scoreById.merge(rec.getId(), ms.getScore(), Double::sum);
                movieById.putIfAbsent(rec.getId(), rec);
            }
        }

        // ── Step 4: fallback if no similarity ────────────────────
        if (scoreById.isEmpty()) {
            return contentService.getTopContentBasedMovies().stream()
                    .filter(m -> !seenMovieIds.contains(m.getId()))
                    .map(m -> mapToDTO(m, m.getPopularity()))
                    .limit(TOP_N)
                    .toList();
        }

        // ── Step 5: sort + return ────────────────────────────────
        return scoreById.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(TOP_N)
                .map(e -> mapToDTO(movieById.get(e.getKey()), e.getValue()))
                .toList();
    }

    // 🔥 SIMILAR MOVIES
    public List<RecommendationDTO> getSimilarMovies(Long movieId) {
        return contentService.getSimilarMovies(movieId).stream()
                .map(ms -> mapToDTO(ms.getMovie(), ms.getScore()))
                .toList();
    }

    // 🔥 DTO MAPPER
    private RecommendationDTO mapToDTO(Movie movie, Double score) {
        if (movie == null) return null;

        return new RecommendationDTO(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getPosterUrl(),
                movie.getTrailerUrl(),
                movie.getAvgRating(),
                movie.getPopularity(),
                score
        );
    }
}