package com.movieapp.movierec_backend.repository;

import com.movieapp.movierec_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // Used by UserDetailsServiceImpl to support login with username OR email
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}