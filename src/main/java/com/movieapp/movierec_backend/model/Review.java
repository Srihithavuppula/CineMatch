package com.movieapp.movierec_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private int rating;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ✅ EAGER fetch — ensures getUser() is never null in RecommendationService
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ EAGER fetch — ensures getMovie() is never null in RecommendationService
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId()                  { return id; }
    public String getContent()           { return content; }
    public void setContent(String c)     { this.content = c; }
    public int getRating()               { return rating; }
    public void setRating(int r)         { this.rating = r; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public User getUser()                { return user; }
    public void setUser(User user)       { this.user = user; }
    public Movie getMovie()              { return movie; }
    public void setMovie(Movie movie)    { this.movie = movie; }
}