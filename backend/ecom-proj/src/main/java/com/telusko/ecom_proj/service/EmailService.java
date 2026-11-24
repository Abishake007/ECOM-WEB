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

    @Value("${ecom.app.frontendUrl:http://localhost:5173}")
    private String frontendUrl;

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

    public boolean sendWelcomeEmail(String email, String username) {
        String configuredFrontendUrl = frontendUrl;
        if (configuredFrontendUrl == null || configuredFrontendUrl.isBlank() || configuredFrontendUrl.contains("localhost")) {
            configuredFrontendUrl = "https://ecom-web-vert.vercel.app";
        }
        String shopUrl = configuredFrontendUrl.replaceAll("/+$", "");
        String imageUrl = shopUrl + "/banner.png";
        String safeShopUrl = escapeHtml(shopUrl);
        String html = "<div style=\"margin:0;padding:32px 12px;background:#f1f1f1;font-family:Arial,Helvetica,sans-serif;color:#171717;\">"
                + "<div style=\"max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;\">"
                + "<div style=\"padding:22px 28px;background:#171717;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:2px;\">KLYRO</div>"
                + "<img src=\"" + escapeHtml(imageUrl) + "\" alt=\"Discover the latest at KLYRO\" width=\"600\" style=\"display:block;width:100%;max-width:600px;height:auto;border:0;\">"
                + "<div style=\"padding:30px 28px 34px;line-height:1.65;\">"
                + "<p style=\"margin:0 0 18px;\">Hi " + escapeHtml(username) + ",</p>"
                + "<h1 style=\"margin:0 0 14px;font-size:28px;line-height:1.2;\">Welcome to KLYRO!</h1>"
                + "<p>We're excited to have you here!</p>"
                + "<p>Thank you for joining KLYRO. You've just unlocked a better way to discover products, explore new collections, and enjoy a seamless shopping experience.</p>"
                + "<p>Whether you're looking for everyday essentials or something special, we've got something for you.</p>"
                + "<p style=\"margin-bottom:8px;font-weight:700;\">Here's what you can look forward to:</p>"
                + "<ul style=\"padding-left:22px;margin-top:8px;\">"
                + "<li>Explore a wide range of products.</li>"
                + "<li>Discover exciting collections and new arrivals.</li>"
                + "<li>Save your favourite products.</li>"
                + "<li>Enjoy a smooth and convenient shopping experience.</li>"
                + "</ul>"
                + "<p>Your shopping journey starts now!</p>"
                + "<p style=\"margin:26px 0 10px;font-weight:700;\">Ready to explore?</p>"
                + "<p>Visit KLYRO and discover something you love.</p>"
                + "<p style=\"margin:26px 0 30px;text-align:center;\"><a href=\"" + safeShopUrl + "\" style=\"display:inline-block;padding:14px 34px;background:#171717;color:#ffffff;text-decoration:none;font-weight:700;letter-spacing:1px;\">SHOP NOW</a></p>"
                + "<p>Thank you for choosing us!</p>"
                + "<p style=\"margin-bottom:0;\">Best regards,<br><strong>Team KLYRO</strong><br><em>Shop Smart. Live Better.</em></p>"
                + "</div><div style=\"padding:18px 28px;background:#f7f7f7;color:#777777;font-size:12px;text-align:center;\">© 2026 KLYRO. All rights reserved.</div>"
                + "</div></div>";
        return send(email, "Welcome to KLYRO", html);
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
