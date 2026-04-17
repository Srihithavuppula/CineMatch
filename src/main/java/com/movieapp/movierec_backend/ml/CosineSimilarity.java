package com.movieapp.movierec_backend.ml;

public class CosineSimilarity {

    public static double compute(double[] a, double[] b) {

        if (a.length != b.length) {
            throw new IllegalArgumentException("Vector sizes do not match");
        }

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0 || normB == 0) return 0.0;

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}