package com.movieapp.movierec_backend.controller;

import com.movieapp.movierec_backend.service.FavoriteService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map; // ✅ added

@RestController
@RequestMapping("/favorites")
@CrossOrigin
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    // ⭐ Add favorite
    @PostMapping("/{movieId}")
    public String addFavorite(@PathVariable Long movieId, Principal principal) {
        favoriteService.addFavorite(movieId, principal.getName());
        return "Added to favorites";
    }

    // ❌ Remove favorite
    @DeleteMapping("/{movieId}")
    public String removeFavorite(@PathVariable Long movieId, Principal principal) {
        favoriteService.removeFavorite(movieId, principal.getName());
        return "Removed from favorites";
    }

    // 📄 Get all favorites ✅ FIXED
    @GetMapping
    public List<Map<String, Object>> getFavorites(Principal principal) {
        return favoriteService.getFavorites(principal.getName());
    }
}