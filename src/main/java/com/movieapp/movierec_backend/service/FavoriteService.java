package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.model.Favorite;
import com.movieapp.movierec_backend.model.Movie;
import com.movieapp.movierec_backend.model.User;
import com.movieapp.movierec_backend.repository.FavoriteRepository;
import com.movieapp.movierec_backend.repository.MovieRepository;
import com.movieapp.movierec_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Map;      // ✅ added
import java.util.HashMap; // ✅ added

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    // ✅ Add to favorites
    public String addFavorite(Long movieId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        Optional<Favorite> existing =
                favoriteRepository.findByUserIdAndMovieId(user.getId(), movieId);

        if (existing.isPresent()) {
            return "Already in favorites";
        }

        Favorite fav = new Favorite();
        fav.setUser(user);
        fav.setMovie(movie);

        favoriteRepository.save(fav);

        return "Added to favorites";
    }

    // ❌ Remove from favorites
    public void removeFavorite(Long movieId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Favorite favorite = favoriteRepository
                .findByUserIdAndMovieId(user.getId(), movieId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));

        favoriteRepository.delete(favorite);
    }

    // 📄 Get all favorites ✅ FIXED
    public List<Map<String, Object>> getFavorites(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(f -> {
                    Movie m = f.getMovie();

                    Map<String, Object> movieData = new HashMap<>();
                    movieData.put("id", m.getId());
                    movieData.put("title", m.getTitle());
                    movieData.put("tmdbId", m.getTmdbId());

                    return movieData;
                })
                .toList();
    }
}