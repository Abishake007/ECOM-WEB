package com.telusko.ecom_proj.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telusko.ecom_proj.model.Order;
import com.telusko.ecom_proj.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private static final URI BREVO_EMAIL_ENDPOINT = URI.create("https://api.brevo.com/v3/smtp/email");
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;

    @Value("${BREVO_API_KEY:}")
    private String apiKey;

    @Value("${BREVO_SENDER_EMAIL:}")
    private String senderEmail;

    @Value("${BREVO_SENDER_NAME:KLYRO}")
    private String senderName;

    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void sendOrderConfirmationEmail(Order order) {
        if (order.getUser() == null || order.getUser().getEmail() == null) return;
        StringBuilder html = new StringBuilder();
        html.append("<h1>Thank you for your KLYRO order!</h1>")
                .append("<p>Hi ").append(escapeHtml(order.getUser().getUsername())).append(",</p>")
                .append("<p>Your order #").append(order.getId()).append(" is being processed.</p>")
                .append("<h3>Shipping information</h3><p>")
                .append(escapeHtml(order.getShippingAddress())).append("</p>")
                .append("<h3>Order summary</h3><ul>");
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                html.append("<li>").append(escapeHtml(item.getProduct().getName()))
                        .append(" × ").append(item.getQuantity()).append("</li>");
            }
        }
        html.append("</ul><p>Total: ").append(order.getTotalAmount()).append("</p>");
        send(order.getUser().getEmail(), "KLYRO order confirmation #" + order.getId(), html.toString());
    }

    public void sendPasswordResetEmail(String email, String resetUrl) {
        String html = "<h1>Reset your KLYRO password</h1>"
                + "<p>This link expires in 15 minutes.</p>"
                + "<p><a href=\"" + escapeHtml(resetUrl) + "\">Reset password</a></p>"
                + "<p>If you did not request this, you can ignore this email.</p>";
        send(email, "Reset your KLYRO password", html);
    }

    private void send(String recipient, String subject, String htmlContent) {
        if (apiKey == null || apiKey.isBlank() || senderEmail == null || senderEmail.isBlank()) {
            System.err.println("Brevo email is not configured: set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
            return;
        }

        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sender", Map.of("name", senderName, "email", senderEmail));
            payload.put("to", List.of(Map.of("email", recipient)));
            payload.put("subject", subject);
            payload.put("htmlContent", htmlContent);

            HttpRequest request = HttpRequest.newBuilder(BREVO_EMAIL_ENDPOINT)
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("Brevo email request failed with HTTP " + response.statusCode() + ": " + response.body());
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.err.println("Brevo email request was interrupted.");
        } catch (Exception exception) {
            System.err.println("Brevo email request failed: " + exception.getMessage());
        }
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
}
