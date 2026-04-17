package com.movieapp.movierec_backend.repository;

import com.movieapp.movierec_backend.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // ✅ JOIN FETCH guarantees movie is loaded — never null in service layer
    @Query("SELECT f FROM Favorite f JOIN FETCH f.movie WHERE f.user.id = :userId")
    List<Favorite> findByUserId(@Param("userId") Long userId);

    Optional<Favorite> findByUserIdAndMovieId(Long userId, Long movieId);

    void deleteByUserIdAndMovieId(Long userId, Long movieId);
}