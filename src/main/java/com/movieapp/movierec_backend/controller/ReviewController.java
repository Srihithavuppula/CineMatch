package com.movieapp.movierec_backend.controller;

import com.movieapp.movierec_backend.dto.ReviewDTO;
import com.movieapp.movierec_backend.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // ✅ Add or Update Review
    @PostMapping
    public ReviewDTO addOrUpdateReview(@RequestBody ReviewDTO dto, Principal principal) {
        return reviewService.addOrUpdateReview(dto, principal.getName());
    }

    // ✅ Get reviews for a movie
    @GetMapping("/movie/{movieId}")
    public List<ReviewDTO> getReviewsByMovie(@PathVariable Long movieId) {
        return reviewService.getReviewsByMovie(movieId);
    }

    // ✅ FIXED: Get logged-in user's reviews
    @GetMapping("/user")
    public List<ReviewDTO> getMyReviews(Principal principal) {
        return reviewService.getReviewsByUser(principal.getName());
    }

    // ✅ Delete review
    
    @DeleteMapping("/{id}")
    public String deleteReview(@PathVariable Long id, Principal principal) {
        reviewService.deleteReview(id, principal.getName());
        return "Review deleted";
    }
}