package com.example.TodoList.Controller;

import com.example.TodoList.DTO.AuthResponse;
import com.example.TodoList.DTO.LoginRequest;
import com.example.TodoList.DTO.SignupRequest;
import com.example.TodoList.Entity.User;
import com.example.TodoList.Repository.UserRepository;
import com.example.TodoList.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtil.generateToken(user.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), "Login successful"));
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, "Invalid username or password"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse(null, null, "Username already exists"));
            }

            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse(null, null, "Email already exists"));
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            userRepository.save(user);

            String token = jwtUtil.generateToken(user.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), "Signup successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, "Error during signup: " + e.getMessage()));
        }
    }
}