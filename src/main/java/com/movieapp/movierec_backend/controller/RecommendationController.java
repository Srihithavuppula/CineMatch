package com.movieapp.movierec_backend.controller;

import com.movieapp.movierec_backend.dto.RecommendationDTO;
import com.movieapp.movierec_backend.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * ✅ GET /recommendations/user
     * Uses JWT → automatically identifies user
     */
    @GetMapping("/user")
    public ResponseEntity<List<RecommendationDTO>> getUserRecommendations(
            Authentication authentication) {

        String username = authentication.getName();

        List<RecommendationDTO> recs =
                recommendationService.getRecommendationsForUser(username);

        return ResponseEntity.ok(recs);
    }

    /**
     * GET /recommendations/movie/{movieId}
     */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<RecommendationDTO>> getSimilarMovies(
            @PathVariable Long movieId) {

        List<RecommendationDTO> similar =
                recommendationService.getSimilarMovies(movieId);

        return ResponseEntity.ok(similar);
    }
}