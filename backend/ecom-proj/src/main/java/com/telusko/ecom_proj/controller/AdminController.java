package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.Order;
import com.telusko.ecom_proj.model.User;
import com.telusko.ecom_proj.repo.OrderRepo;
import org.springframework.http.ResponseEntity;
import com.telusko.ecom_proj.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepo orderRepo;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/access")
    public ResponseEntity<Void> checkAdminAccess() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        List<String> allowed = List.of("PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED");
        String status = request.status == null ? "" : request.status.toUpperCase();
        if (!allowed.contains(status)) return ResponseEntity.badRequest().body("Invalid order status");
        var order = orderRepo.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        order.setStatus(status);
        return ResponseEntity.ok(orderRepo.save(order));
    }

    public static class StatusRequest { public String status; }
}
