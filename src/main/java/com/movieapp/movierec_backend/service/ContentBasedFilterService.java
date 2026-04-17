package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.model.Movie;
import com.movieapp.movierec_backend.repository.MovieRepository;
import com.movieapp.movierec_backend.ml.TFIDFVectorizer;
import com.movieapp.movierec_backend.ml.CosineSimilarity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContentBasedFilterService {

    private final MovieRepository movieRepository;

    private static final Set<String> STOP_WORDS = Set.of(
            "the","a","an","of","in","on","and","is","to","for","with"
    );

    public ContentBasedFilterService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // 🔥 MAIN METHOD (FINAL FIXED)
    public List<MovieScore> getSimilarMovies(Long movieId) {

        List<Movie> allMovies = movieRepository.findAll();

        Movie target = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // ✅ SAFE BUILD (NO Map.entry NPE)
        Map<Movie, String> movieDocs = new HashMap<>();

        for (Movie m : allMovies) {
            String doc = buildDocument(m);
            if (doc != null) {
                movieDocs.put(m, doc);
            }
        }

        // ❌ If target invalid → return empty
        if (!movieDocs.containsKey(target)) {
            return Collections.emptyList();
        }

        // ✅ ALWAYS FIT (important for correctness)
        TFIDFVectorizer vectorizer = new TFIDFVectorizer();
        vectorizer.fit(new ArrayList<>(movieDocs.values()));

        double[] targetVector = vectorizer.transform(movieDocs.get(target));

        return movieDocs.entrySet().stream()
                .filter(entry -> !entry.getKey().getId().equals(movieId))
                .map(entry -> {
                    double score = CosineSimilarity.compute(
                            targetVector,
                            vectorizer.transform(entry.getValue())
                    );
                    return new MovieScore(entry.getKey(), score);
                })
                .filter(ms -> ms.getScore() > 0.05) // remove weak matches
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(10)
                .collect(Collectors.toList());
    }

    // 🔥 STRICT DOCUMENT BUILDER
    private String buildDocument(Movie movie) {

        if (movie == null) return null;

        String description = movie.getDescription();

        // 🔥 HARD FILTER (removes Helix completely)
        if (description == null || description.trim().length() < 15) {
            return null;
        }

        String genres = movie.getGenres() != null
                ? movie.getGenres().stream()
                    .map(g -> g.getName().toLowerCase())
                    .collect(Collectors.joining(" "))
                : "";

        description = description.toLowerCase()
                .replaceAll("[^a-zA-Z ]", " ");

        // remove stopwords
        description = Arrays.stream(description.split("\\s+"))
                .filter(word -> !STOP_WORDS.contains(word))
                .collect(Collectors.joining(" "));

        // final validation
        if (description.trim().length() < 10 && genres.trim().isEmpty()) {
            return null;
        }

        // boost genres
        return genres + " " + genres + " " + genres + " " + description;
    }

    // 🔥 HOMEPAGE
    public List<Movie> getTopContentBasedMovies() {
        return movieRepository.findAll().stream()
                .filter(m -> m.getDescription() != null && m.getDescription().trim().length() > 15)
                .sorted((a, b) -> Double.compare(
                        b.getPopularity() != null ? b.getPopularity() : 0,
                        a.getPopularity() != null ? a.getPopularity() : 0
                ))
                .limit(10)
                .collect(Collectors.toList());
    }

    // 🔥 HELPER CLASS
    public static class MovieScore {
        private final Movie movie;
        private final double score;

        public MovieScore(Movie movie, double score) {
            this.movie = movie;
            this.score = score;
        }

        public Movie getMovie() {
            return movie;
        }

        public double getScore() {
            return score;
        }
    }
}