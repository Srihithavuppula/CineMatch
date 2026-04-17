package com.movieapp.movierec_backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "favorites",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "movie_id"})
)
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ EAGER fetch so getMovie() is never null
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ✅ EAGER fetch so getMovie() is never null
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Favorite() {}

    public Favorite(User user, Movie movie) {
        this.user  = user;
        this.movie = movie;
    }

    public Long getId()                  { return id; }
    public User getUser()                { return user; }
    public void setUser(User user)       { this.user = user; }
    public Movie getMovie()              { return movie; }
    public void setMovie(Movie movie)    { this.movie = movie; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
}