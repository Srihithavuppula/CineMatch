package com.movieapp.movierec_backend.controller;

import com.movieapp.movierec_backend.dto.AuthRequestDTO;
import com.movieapp.movierec_backend.dto.AuthResponseDTO;
import com.movieapp.movierec_backend.dto.RegisterRequestDTO;
import com.movieapp.movierec_backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /auth/register
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequestDTO request) {
        String message = authService.register(request);
        return ResponseEntity.ok(message);
    }

    // POST /auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}