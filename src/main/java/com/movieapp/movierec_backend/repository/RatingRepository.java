package com.movieapp.movierec_backend.repository;

import com.movieapp.movierec_backend.model.Rating;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    @Query("SELECT r.movie.id FROM Rating r WHERE r.user.id = :userId")
    List<Long> findMovieIdsByUserId(@Param("userId") Long userId);
}