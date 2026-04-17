package com.movieapp.movierec_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "genres")
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    // ✅ GETTERS
    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    // ✅ SETTERS
    public void setId(Integer id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }
}