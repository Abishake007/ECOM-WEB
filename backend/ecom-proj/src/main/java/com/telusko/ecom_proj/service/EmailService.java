package com.telusko.ecom_proj.service;

import com.telusko.ecom_proj.model.Order;
import com.telusko.ecom_proj.model.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Async
    public void sendOrderConfirmationEmail(Order order) {
        if (mailSender == null) {
            System.out.println("MailSender not configured, skipping email.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Confirmation - #" + order.getId());

            StringBuilder content = new StringBuilder();
            content.append("<h1>Thank you for your order!</h1>");
            content.append("<p>Hi ").append(order.getUser().getUsername()).append(",</p>");
            content.append("<p>We've received your order and are processing it.</p>");

            // --- New Shipping Details Section ---
            content.append("<h3>Shipping Information:</h3>");
            content.append("<p><strong>Address:</strong> ").append(order.getShippingAddress()).append("</p>");
            content.append("<p><strong>Phone:</strong> ").append(order.getPhoneNumber()).append("</p>");
            content.append("<hr>");

            content.append("<h3>Order Summary:</h3>");
            content.append("<table border='1' style='border-collapse: collapse; width: 100%;'>");
            content.append("<tr style='background-color: #f2f2f2;'><th>Item</th><th>Quantity</th><th>Price</th></tr>");

            for (OrderItem item : order.getOrderItems()) {
                content.append("<tr>")
                        .append("<td style='padding: 8px;'>").append(item.getProduct().getName()).append("</td>")
                        .append("<td style='padding: 8px;'>").append(item.getQuantity()).append("</td>")
                        .append("<td style='padding: 8px;'>$").append(item.getPrice()).append("</td>")
                        .append("</tr>");
            }

            content.append("</table>");
            content.append("<h3>Total Amount: $").append(order.getTotalAmount()).append("</h3>");
            content.append("<p>Status: ").append(order.getStatus()).append("</p>");

            helper.setText(content.toString(), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}