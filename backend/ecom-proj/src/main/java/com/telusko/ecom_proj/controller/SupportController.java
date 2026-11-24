package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.User;
import com.telusko.ecom_proj.payload.request.SupportRequest;
import com.telusko.ecom_proj.repo.UserRepository;
import com.telusko.ecom_proj.security.services.UserDetailsImpl;
import com.telusko.ecom_proj.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support")
public class SupportController {
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${ADMIN_NOTIFICATION_EMAIL:}")
    private String adminNotificationEmail;

    @Value("${BREVO_SENDER_EMAIL:}")
    private String senderEmail;

    public SupportController(EmailService emailService, UserRepository userRepository) {
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody SupportRequest request) {
        if (request.getSubject() == null || request.getSubject().isBlank() || request.getSubject().length() > 160
                || request.getMessage() == null || request.getMessage().isBlank() || request.getMessage().length() > 5000
                || request.getType() == null || request.getType().isBlank()) {
            return ResponseEntity.badRequest().body("Enter a subject and a message (up to 5000 characters).");
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl details)) {
            return ResponseEntity.status(401).body("Please sign in to contact support.");
        }
        User user = userRepository.findById(details.getId()).orElse(null);
        if (user == null) return ResponseEntity.status(401).body("Please sign in to contact support.");

        String recipient = adminNotificationEmail == null || adminNotificationEmail.isBlank() ? senderEmail : adminNotificationEmail;
        if (recipient == null || recipient.isBlank()) return ResponseEntity.status(503).body("Support email is not configured.");
        String html = "<h2>KLYRO support request</h2><p><b>From:</b> " + escape(user.getUsername()) + " (" + escape(user.getEmail()) + ")</p>"
                + "<p><b>Type:</b> " + escape(request.getType()) + "</p><p><b>Subject:</b> " + escape(request.getSubject()) + "</p>"
                + (request.getProductId() == null ? "" : "<p><b>Product ID:</b> " + request.getProductId() + "</p>")
                + (request.getOrderId() == null ? "" : "<p><b>Order ID:</b> " + request.getOrderId() + "</p>")
                + "<p><b>Message:</b><br>" + escape(request.getMessage()).replace("\n", "<br>") + "</p>";
        boolean sent = emailService.sendSupportNotification(recipient, "KLYRO support: " + request.getSubject().trim(), html);
        if (!sent) return ResponseEntity.status(503).body("We could not send your request right now. Please try again later.");
        emailService.sendSupportNotification(user.getEmail(), "We received your KLYRO support request", "<p>Hi "
                + escape(user.getUsername()) + ", we received your request and will get back to you.</p><p>Subject: " + escape(request.getSubject()) + "</p>");
        return ResponseEntity.ok().body(java.util.Map.of("message", "Your support request was sent."));
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
