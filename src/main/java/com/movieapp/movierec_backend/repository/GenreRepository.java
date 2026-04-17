package com.movieapp.movierec_backend.repository;

import com.movieapp.movierec_backend.model.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Integer> {

    Optional<Genre> findByNameIgnoreCase(String name);

}