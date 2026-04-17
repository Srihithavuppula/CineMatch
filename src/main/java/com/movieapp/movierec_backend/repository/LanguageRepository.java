package com.movieapp.movierec_backend.repository;

import com.movieapp.movierec_backend.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Integer> {

    Optional<Language> findByCode(String code);

}