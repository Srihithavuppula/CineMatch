package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.model.*;
import com.movieapp.movierec_backend.repository.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;

import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.*;

@Service
public class MovieImportService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final LanguageRepository languageRepository;

    public MovieImportService(MovieRepository movieRepository,
                              GenreRepository genreRepository,
                              LanguageRepository languageRepository) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.languageRepository = languageRepository;
    }

    public void importMovies() {

        try {
            InputStream inputStream = getClass().getResourceAsStream("/data/movies.csv");

            if (inputStream == null) {
                System.out.println("❌ movies.csv not found!");
                return;
            }

            CSVReader reader = new CSVReader(new InputStreamReader(inputStream));
            List<String[]> rows = reader.readAll();

            // ✅ Debug header
            System.out.println("HEADER: " + Arrays.toString(rows.get(0)));

            ObjectMapper mapper = new ObjectMapper();

            int success = 0;
            int failed = 0;

            for (int i = 1; i < rows.size(); i++) {

                try {
                    String[] row = rows.get(i);

                    // ✅ Prevent broken rows
                    if (row.length < 18) {
                        System.out.println("⚠ Skipping broken row: " + i);
                        failed++;
                        continue;
                    }

                    // ✅ TMDB ID (correct column)
                    Long tmdbId;
                    try {
                        tmdbId = Long.parseLong(row[3]);
                    } catch (Exception e) {
                        System.out.println("⚠ Invalid TMDB ID at row: " + i + " -> " + row[3]);
                        failed++;
                        continue;
                    }

                    String title = row[17];
                    String overview = row[7];
                    String languageCode = row[5];
                    String releaseDate = row[11];

                    // ❗ Skip empty title
                    if (title == null || title.trim().isEmpty()) continue;

                    // ❗ Skip duplicates
                    if (movieRepository.findByTmdbId(tmdbId).isPresent()) continue;

                    // ✅ Popularity
                    Double popularity = null;
                    try {
                        popularity = Double.parseDouble(row[8]);
                    } catch (Exception ignored) {}

                    // ✅ Extract year
                    Integer year = null;
                    if (releaseDate != null && releaseDate.length() >= 4) {
                        try {
                            year = Integer.parseInt(releaseDate.substring(0, 4));
                        } catch (Exception ignored) {}
                    }

                    // 🎭 GENRES (safe parsing)
                    Set<Genre> movieGenres = new HashSet<>();
                    try {
                        String genresJson = row[1];

                        if (genresJson != null && genresJson.startsWith("[")) {
                            List<Map<String, Object>> genresList =
                                    mapper.readValue(genresJson, List.class);

                            for (Map<String, Object> g : genresList) {
                                String name = (String) g.get("name");

                                genreRepository.findByNameIgnoreCase(name)
                                        .ifPresent(movieGenres::add);
                            }
                        }
                    } catch (Exception ignored) {}

                    // 🌍 LANGUAGE (safe create)
                    Set<Language> languages = new HashSet<>();

                    if (languageCode != null && !languageCode.isEmpty()) {

                        Language lang = languageRepository
                                .findByCode(languageCode)
                                .orElseGet(() -> {
                                    Language l = new Language();
                                    l.setCode(languageCode);
                                    l.setName(languageCode.toUpperCase());
                                    return languageRepository.save(l);
                                });

                        languages.add(lang);
                    }

                    // 🎬 CREATE MOVIE
                    Movie movie = new Movie();
                    movie.setTmdbId(tmdbId);
                    movie.setTitle(title);
                    movie.setDescription(overview != null ? overview : "");
                    movie.setReleaseYear(year);
                    movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + row[4]);// dataset doesn't include poster
                    movie.setTrailerUrl(null);
                    movie.setGenres(movieGenres);
                    movie.setLanguages(languages);
                    movie.setAvgRating(0.0);
                    movie.setTotalReviews(0);
                    movie.setPopularity(popularity);

                    // ✅ SAVE
                    movieRepository.save(movie);

                    success++;

                } catch (Exception e) {
                    failed++;
                    System.out.println("❌ Row failed: " + i);
                }
            }

            System.out.println("✅ IMPORT DONE");
            System.out.println("✔ Success: " + success);
            System.out.println("❌ Failed: " + failed);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}