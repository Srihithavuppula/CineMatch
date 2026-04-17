package com.movieapp.movierec_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long jwtExpirationMs;

    // Constructor injection — values come from application.properties
    public JwtTokenProvider(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration}") long jwtExpirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
    }

    // ✅ Generate token
    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS512)
                .compact();
    }

    // ✅ Extract username
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    // ✅ Validate token
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("JWT expired: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("JWT malformed: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT empty/null: " + e.getMessage());
        }
        return false;
    }

    // ✅ FIXED for JJWT 0.12.x
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}