package com.movieapp.movierec_backend.controller;

import com.movieapp.movierec_backend.model.Movie;
import com.movieapp.movierec_backend.service.MovieService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
@CrossOrigin
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    // ✅ Get all movies
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    // ✅ Search
    @GetMapping("/search")
    public List<Movie> search(@RequestParam String title) {
        return movieService.searchMovies(title);
    }

    // ✅ Filter by genre
    @GetMapping("/genre")
    public List<Movie> byGenre(@RequestParam String name) {
        return movieService.getMoviesByGenre(name);
    }

    // ✅ Filter by language
    @GetMapping("/language")
    public List<Movie> byLanguage(@RequestParam String name) {
        return movieService.getMoviesByLanguage(name);
    }
}