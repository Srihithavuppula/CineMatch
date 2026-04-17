package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.model.Movie;
import com.movieapp.movierec_backend.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public List<Movie> searchMovies(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Movie> getMoviesByGenre(String name) {
        return movieRepository.findByGenres_NameIgnoreCase(name);
    }

    public List<Movie> getMoviesByLanguage(String name) {
        return movieRepository.findByLanguages_NameIgnoreCase(name);
    }
}