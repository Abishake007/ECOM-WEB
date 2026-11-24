package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.ERole;
import com.telusko.ecom_proj.model.Role;
import com.telusko.ecom_proj.model.User;
import com.telusko.ecom_proj.payload.request.LoginRequest;
import com.telusko.ecom_proj.payload.request.SignupRequest;
import com.telusko.ecom_proj.payload.response.JwtResponse;
import com.telusko.ecom_proj.payload.response.MessageResponse;
import com.telusko.ecom_proj.repo.RoleRepository;
import com.telusko.ecom_proj.repo.UserRepository;
import com.telusko.ecom_proj.security.jwt.JwtUtils;
import com.telusko.ecom_proj.security.services.UserDetailsImpl;
import com.telusko.ecom_proj.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @Autowired
  EmailService emailService;

  @Value("${ecom.app.frontendUrl:http://localhost:5173}")
  String frontendUrl;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

    SecurityContextHolder.getContext().setAuthentication(authentication);
    String jwt = jwtUtils.generateJwtToken(authentication);
    
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
    userRepository.findById(userDetails.getId()).ifPresent(user -> {
      if (user.getWelcomeEmailSent() == 0
          && emailService.sendWelcomeEmail(user.getEmail(), user.getUsername())) {
        user.setWelcomeEmailSent(1);
        userRepository.save(user);
      }
    });
    List<String> roles = userDetails.getAuthorities().stream()
        .map(item -> item.getAuthority())
        .collect(Collectors.toList());

    return ResponseEntity.ok(new JwtResponse(jwt, 
                         userDetails.getId(), 
                         userDetails.getUsername(), 
                         userDetails.getEmail(), 
                         roles));
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Username is already taken!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Email is already in use!"));
    }

    // Create new user's account
    User user = new User(signUpRequest.getUsername(), 
               signUpRequest.getEmail(),
               encoder.encode(signUpRequest.getPassword()));

    Set<String> strRoles = signUpRequest.getRole();
    Set<Role> roles = new HashSet<>();

    if (strRoles == null) {
      Role userRole = roleRepository.findByName(ERole.ROLE_USER)
          .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
      roles.add(userRole);
    } else {
      strRoles.forEach(role -> {
        switch (role) {
        case "admin":
          Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
              .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
          roles.add(adminRole);

          break;
        case "mod":
          Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
              .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
          roles.add(modRole);

          break;
        default:
          Role userRole = roleRepository.findByName(ERole.ROLE_USER)
              .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
          roles.add(userRole);
        }
      });
    }

    user.setRoles(roles);
    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }

  @PostMapping("/password-reset/request")
  public ResponseEntity<?> requestPasswordReset(@RequestBody PasswordResetRequest request) {
    userRepository.findByEmail(request.email == null ? "" : request.email.trim())
        .ifPresent(user -> {
          String token = jwtUtils.generatePasswordResetToken(user.getUsername(), user.getPassword());
          emailService.sendPasswordResetEmail(user.getEmail(), frontendUrl + "/reset-password?token=" + token);
        });
    return ResponseEntity.ok(new MessageResponse("If that email is registered, a password reset link will be sent."));
  }

  @PostMapping("/password-reset/confirm")
  public ResponseEntity<?> confirmPasswordReset(@RequestBody PasswordResetConfirmRequest request) {
    if (request.token == null || request.password == null || request.password.length() < 8) {
      return ResponseEntity.badRequest().body(new MessageResponse("Use a valid reset link and a password with at least 8 characters."));
    }
    try {
      String username = jwtUtils.getUserNameFromJwtToken(request.token);
      User user = userRepository.findByUsername(username).orElse(null);
      if (user == null || !jwtUtils.isValidPasswordResetToken(request.token, user.getPassword())) {
        return ResponseEntity.badRequest().body(new MessageResponse("This reset link is invalid or expired. Request a new one."));
      }
      user.setPassword(encoder.encode(request.password));
      userRepository.save(user);
      return ResponseEntity.ok(new MessageResponse("Password updated. You can now sign in."));
    } catch (RuntimeException exception) {
      return ResponseEntity.badRequest().body(new MessageResponse("This reset link is invalid or expired. Request a new one."));
    }
  }

  public static class PasswordResetRequest { public String email; }
  public static class PasswordResetConfirmRequest { public String token; public String password; }
}
