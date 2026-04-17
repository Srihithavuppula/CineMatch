package com.movieapp.movierec_backend.repository;

import com.movieapp.movierec_backend.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Optional<Movie> findByTmdbId(Long tmdbId);

    List<Movie> findByTitleContainingIgnoreCase(String title);

    List<Movie> findByGenres_NameIgnoreCase(String name);

    List<Movie> findByLanguages_NameIgnoreCase(String name);
}