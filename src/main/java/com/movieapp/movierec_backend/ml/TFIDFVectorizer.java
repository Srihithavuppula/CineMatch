package com.movieapp.movierec_backend.ml;

import java.util.*;

public class TFIDFVectorizer {

    private Map<String, Integer> vocab = new HashMap<>();
    private Map<String, Double> idf = new HashMap<>();

    private static final Set<String> STOPWORDS = Set.of(
            "the","is","in","at","of","on","and","a","to","for","with",
            "that","this","it","as","an","by","from","are","was"
    );

    // 🔥 FIT (build vocab + IDF)
    public void fit(List<String> documents) {

        Map<String, Integer> docFreq = new HashMap<>();
        int index = 0;
        int totalDocs = documents.size();

        for (String doc : documents) {

            Set<String> seen = new HashSet<>();

            for (String word : doc.split("\\s+")) {
                word = word.toLowerCase();

                if (STOPWORDS.contains(word) || word.isBlank()) continue;

                // vocab
                if (!vocab.containsKey(word)) {
                    vocab.put(word, index++);
                }

                // doc frequency
                if (!seen.contains(word)) {
                    docFreq.put(word, docFreq.getOrDefault(word, 0) + 1);
                    seen.add(word);
                }
            }
        }

        // 🔥 SMOOTHED IDF (IMPORTANT FIX)
        for (String word : vocab.keySet()) {
            int df = docFreq.getOrDefault(word, 1);
            double value = Math.log((1.0 + totalDocs) / (1.0 + df)) + 1.0;
            idf.put(word, value);
        }
    }

    // 🔥 TRANSFORM
    public double[] transform(String document) {

        double[] vector = new double[vocab.size()];
        Map<String, Integer> termFreq = new HashMap<>();

        // TF
        for (String word : document.split("\\s+")) {
            word = word.toLowerCase();

            if (STOPWORDS.contains(word) || word.isBlank()) continue;

            termFreq.put(word, termFreq.getOrDefault(word, 0) + 1);
        }

        // TF-IDF
        for (Map.Entry<String, Integer> entry : termFreq.entrySet()) {

            String word = entry.getKey();

            if (vocab.containsKey(word)) {

                int idx = vocab.get(word);

                double tf = entry.getValue();
                double idfValue = idf.getOrDefault(word, 0.0);

                vector[idx] = tf * idfValue;
            }
        }

        // 🔥 NORMALIZATION (CRITICAL FIX)
        normalize(vector);

        return vector;
    }

    // 🔥 L2 NORMALIZATION
    private void normalize(double[] vector) {
        double norm = 0.0;

        for (double v : vector) {
            norm += v * v;
        }

        norm = Math.sqrt(norm);

        if (norm == 0) return;

        for (int i = 0; i < vector.length; i++) {
            vector[i] /= norm;
        }
    }
}