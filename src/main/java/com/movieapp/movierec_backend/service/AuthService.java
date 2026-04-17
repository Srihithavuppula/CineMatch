package com.movieapp.movierec_backend.service;

import com.movieapp.movierec_backend.dto.AuthRequestDTO;
import com.movieapp.movierec_backend.dto.AuthResponseDTO;
import com.movieapp.movierec_backend.dto.RegisterRequestDTO;
import com.movieapp.movierec_backend.model.Role;
import com.movieapp.movierec_backend.model.User;
import com.movieapp.movierec_backend.repository.UserRepository;
import com.movieapp.movierec_backend.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    public String register(RegisterRequestDTO request) {
        // Check for existing username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken: " + request.getUsername());
        }

        // Check for existing email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        // Build and save new user with encoded password and default role USER
        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.USER
        );

        userRepository.save(user);
        return "User registered successfully.";
    }

    public AuthResponseDTO login(AuthRequestDTO request) {
        // Authenticate — throws exception if credentials are wrong
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),   // can be username OR email (handled in UserDetailsServiceImpl)
                        request.getPassword()
                )
        );

        // Generate JWT from authenticated principal's username
        String username = authentication.getName();
        String token = jwtTokenProvider.generateToken(username);

        return new AuthResponseDTO(token);
    }
}