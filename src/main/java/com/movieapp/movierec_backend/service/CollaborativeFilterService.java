package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.model.Movie;
import com.movieapp.movierec_backend.repository.MovieRepository;
import com.movieapp.movierec_backend.repository.RatingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CollaborativeFilterService {

    private final RatingRepository ratingRepository;
    private final MovieRepository movieRepository;

    public CollaborativeFilterService(RatingRepository ratingRepository,
                                      MovieRepository movieRepository) {
        this.ratingRepository = ratingRepository;
        this.movieRepository = movieRepository;
    }

    public List<Movie> getRecommendations(Long userId) {

        List<Long> ratedMovieIds = ratingRepository.findMovieIdsByUserId(userId);

        return movieRepository.findAll().stream()
                .filter(movie -> !ratedMovieIds.contains(movie.getId()))
                .sorted((a, b) -> Double.compare(
                        b.getAvgRating() != null ? b.getAvgRating() : 0,
                        a.getAvgRating() != null ? a.getAvgRating() : 0
                ))
                .limit(10)
                .toList();
    }
}