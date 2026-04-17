package com.movieapp.movierec_backend.dto;

public class RecommendationDTO {

    private Long movieId;
    private String title;
    private String description;
    private String posterUrl;
    private String trailerUrl;

    private Double avgRating;
    private Double popularity;
    private Double score;

    public RecommendationDTO() {
    }

    public RecommendationDTO(Long movieId, String title, String description,
                             String posterUrl, String trailerUrl,
                             Double avgRating, Double popularity, Double score) {
        this.movieId = movieId;
        this.title = title;
        this.description = description;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;

        // 🔥 NULL SAFETY
        this.avgRating = avgRating != null ? avgRating : 0.0;
        this.popularity = popularity != null ? popularity : 0.0;
        this.score = score != null ? score : 0.0;
    }

    // Getters and Setters

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }

    public Double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }

    public Double getPopularity() {
        return popularity;
    }

    public void setPopularity(Double popularity) {
        this.popularity = popularity;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}