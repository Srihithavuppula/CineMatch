package com.movieapp.movierec_backend.repository;

import com.movieapp.movierec_backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByMovieId(Long movieId);

    // ✅ JOIN FETCH guarantees movie is loaded — never null when accessed in RecommendationService
    @Query("SELECT r FROM Review r JOIN FETCH r.movie WHERE r.user.id = :userId")
    List<Review> findByUserId(@Param("userId") Long userId);

    Optional<Review> findByUserIdAndMovieId(Long userId, Long movieId);

    void deleteByUserIdAndMovieId(Long userId, Long movieId);
}