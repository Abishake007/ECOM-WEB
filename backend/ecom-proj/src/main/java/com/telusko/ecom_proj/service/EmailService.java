package com.telusko.ecom_proj.service;

import com.telusko.ecom_proj.model.Order;
import com.telusko.ecom_proj.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {
    private static final URI BREVO_EMAIL_ENDPOINT = URI.create("https://api.brevo.com/v3/smtp/email");
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${BREVO_API_KEY:}")
    private String apiKey;

    @Value("${BREVO_SENDER_EMAIL:}")
    private String senderEmail;

    @Value("${BREVO_SENDER_NAME:KLYRO}")
    private String senderName;

    @Value("${ADMIN_NOTIFICATION_EMAIL:}")
    private String adminNotificationEmail;

    public void sendOrderConfirmationEmail(Order order) {
        if (order.getUser() == null || order.getUser().getEmail() == null) return;
        StringBuilder items = new StringBuilder("<table><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr>");
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                items.append("<tr><td>").append(escapeHtml(item.getProduct().getName()))
                        .append("</td><td>").append(item.getQuantity())
                        .append("</td><td>").append(item.getPrice())
                        .append("</td><td>").append(item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                        .append("</td></tr>");
            }
        }
        items.append("</table>");
        String details = "<p>Order #" + order.getId() + "</p><p>Customer: "
                + escapeHtml(order.getUser().getUsername()) + " (" + escapeHtml(order.getUser().getEmail()) + ")</p>"
                + "<p>Payment: " + escapeHtml(order.getPaymentMethod())
                + ("COD".equals(order.getPaymentMethod()) ? " (collect on delivery)" : " (paid online)")
                + "</p><h3>Delivery details</h3><p>" + escapeHtml(order.getShippingAddress())
                + "</p><p>Phone: " + escapeHtml(order.getPhoneNumber()) + "</p><h3>Items</h3>" + items
                + "<p><strong>Order total: " + order.getTotalAmount() + "</strong></p>";
        send(order.getUser().getEmail(), "KLYRO order confirmation #" + order.getId(), "<h1>Thank you for your KLYRO order!</h1>" + details);
        String adminRecipient = adminNotificationEmail == null || adminNotificationEmail.isBlank() ? senderEmail : adminNotificationEmail;
        if (adminRecipient != null && !adminRecipient.isBlank()) {
            send(adminRecipient, "New KLYRO order #" + order.getId(), "<h1>New order received</h1>" + details);
        }
    }

    public boolean sendSupportNotification(String recipient, String subject, String html) {
        return send(recipient, subject, html);
    }
    public void sendPasswordResetEmail(String email, String resetUrl) {
        String html = "<h1>Reset your KLYRO password</h1>"
                + "<p>This link expires in 15 minutes.</p>"
                + "<p><a href=\"" + escapeHtml(resetUrl) + "\">Reset password</a></p>"
                + "<p>If you did not request this, you can ignore this email.</p>";
        send(email, "Reset your KLYRO password", html);
    }

    private boolean send(String recipient, String subject, String htmlContent) {
        if (apiKey == null || apiKey.isBlank() || senderEmail == null || senderEmail.isBlank()) {
            System.err.println("Brevo email is not configured: set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
            return false;
        }

        try {
            String payload = "{\"sender\":{\"name\":\"" + escapeJson(senderName)
                    + "\",\"email\":\"" + escapeJson(senderEmail)
                    + "\"},\"to\":[{\"email\":\"" + escapeJson(recipient)
                    + "\"}],\"subject\":\"" + escapeJson(subject)
                    + "\",\"htmlContent\":\"" + escapeJson(htmlContent) + "\"}";

            HttpRequest request = HttpRequest.newBuilder(BREVO_EMAIL_ENDPOINT)
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("Brevo email request failed with HTTP " + response.statusCode() + ": " + response.body());
                return false;
            }
            return true;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.err.println("Brevo email request was interrupted.");
            return false;
        } catch (Exception exception) {
            System.err.println("Brevo email request failed: " + exception.getMessage());
            return false;
        }
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        StringBuilder escaped = new StringBuilder(value.length() + 16);
        for (int i = 0; i < value.length(); i++) {
            char character = value.charAt(i);
            switch (character) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> {
                    if (character < 0x20) escaped.append(String.format("\\u%04x", (int) character));
                    else escaped.append(character);
                }
            }
        }
        return escaped.toString();
    }
}
