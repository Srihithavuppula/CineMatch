package com.movieapp.movierec_backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class MovieDTO {
    private Long id;
    private String title;
    private String description;
    private Integer releaseYear;
    private String posterUrl;
    private Float avgRating;
    private Integer totalReviews;
    private List<String> genres;
    private List<String> languages;
    private List<String> platforms;
}