package com.movieapp.movierec_backend.dto;

public class FavoriteDTO {

    private Long id;
    private Long movieId;
    private String title; // optional (for response)

    public FavoriteDTO() {}

    public FavoriteDTO(Long id, Long movieId, String title) {
        this.id = id;
        this.movieId = movieId;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public Long getMovieId() {
        return movieId;
    }

    public String getTitle() {
        return title;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}