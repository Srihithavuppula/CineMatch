package com.movieapp.movierec_backend.dto;

import java.time.LocalDateTime;

public class ReviewDTO {

    private Long id;
    private String username;
    private String movieTitle;
    private Long movieId;
    private String content;
    private int rating;
    private LocalDateTime createdAt;

    // ✅ GETTERS

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Long getMovieId() {
        return movieId;
    }

    public String getContent() {
        return content;
    }

    public int getRating() {
        return rating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }

    // ✅ SETTERS

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}