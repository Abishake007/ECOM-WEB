package com.telusko.ecom_proj.service;

import com.telusko.ecom_proj.model.*;
import com.telusko.ecom_proj.payload.request.OrderRequest;
import com.telusko.ecom_proj.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Order createOrder(User user, OrderRequest orderRequest) {
        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            throw new IllegalArgumentException("An order must contain at least one item.");
        }
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PROCESSING");
        String paymentMethod = orderRequest.getPaymentMethod() == null
                ? "STRIPE" : orderRequest.getPaymentMethod().trim().toUpperCase();
        if (!paymentMethod.equals("STRIPE") && !paymentMethod.equals("COD")) {
            throw new IllegalArgumentException("Choose a valid payment method.");
        }
        order.setPaymentMethod(paymentMethod);
        order.setOrderDate(new Date());
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPhoneNumber(orderRequest.getPhoneNumber());

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderRequest.CartItemRequest itemRequest : orderRequest.getItems()) {
            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() < 1) {
                throw new IllegalArgumentException("Item quantity must be at least 1.");
            }
            Product product = productRepo.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            if (!Boolean.TRUE.equals(product.getProductAvailable()) || product.getStockQuantity() == null || product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Reduce stock
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepo.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            orderItems.add(orderItem);
        }

        BigDecimal discountRate = switch (orderRequest.getCouponCode() == null ? "" : orderRequest.getCouponCode().trim().toUpperCase()) {
            case "KLYRO10" -> new BigDecimal("0.10");
            case "WELCOME15" -> new BigDecimal("0.15");
            case "" -> BigDecimal.ZERO;
            default -> throw new IllegalArgumentException("Invalid coupon code.");
        };
        BigDecimal discount = subtotal.multiply(discountRate).setScale(2, RoundingMode.HALF_UP);
        order.setTotalAmount(subtotal.add(new BigDecimal("10.00")).subtract(discount).max(BigDecimal.ZERO));

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepo.save(order);

        // Send confirmation email
        emailService.sendOrderConfirmationEmail(savedOrder);

        return savedOrder;
    }

    public List<Order> getUserOrders(User user) {
        return orderRepo.findByUser(user);
    }
}
