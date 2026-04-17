package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.dto.ReviewDTO;
import com.movieapp.movierec_backend.model.Movie;
import com.movieapp.movierec_backend.model.Review;
import com.movieapp.movierec_backend.model.User;
import com.movieapp.movierec_backend.repository.MovieRepository;
import com.movieapp.movierec_backend.repository.ReviewRepository;
import com.movieapp.movierec_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Add or Update Review
    public ReviewDTO addOrUpdateReview(ReviewDTO dto, String username) {

        if (dto.getMovieId() == null) {
            throw new RuntimeException("Movie ID cannot be null");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // ✅ Prevent duplicate reviews
        Review review = reviewRepository
                .findByUserIdAndMovieId(user.getId(), dto.getMovieId())
                .orElseGet(Review::new);

        review.setUser(user);
        review.setMovie(movie);
        review.setContent(dto.getContent());
        review.setRating(dto.getRating());

        return toDTO(reviewRepository.save(review));
    }

    // ✅ Get reviews by movie
    public List<ReviewDTO> getReviewsByMovie(Long movieId) {
        return reviewRepository.findByMovieId(movieId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ✅ FIXED: Get reviews by logged-in user
    public List<ReviewDTO> getReviewsByUser(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reviewRepository.findByUserId(user.getId())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ✅ Delete review
    

    // ✅ Convert Entity → DTO
    private ReviewDTO toDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setUsername(review.getUser().getUsername());
        dto.setMovieId(review.getMovie().getId());
        dto.setMovieTitle(review.getMovie().getTitle());
        dto.setContent(review.getContent());
        dto.setRating(review.getRating());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
    
    public void deleteReview(Long reviewId, String username) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // 🔒 Only owner can delete
        if (!review.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        reviewRepository.delete(review);
    }
}