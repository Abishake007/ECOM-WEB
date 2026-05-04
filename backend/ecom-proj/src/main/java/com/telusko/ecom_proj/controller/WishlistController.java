package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.Product;
import com.telusko.ecom_proj.model.Wishlist;
import com.telusko.ecom_proj.payload.response.MessageResponse;
import com.telusko.ecom_proj.repo.WishlistRepository;
import com.telusko.ecom_proj.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private com.telusko.ecom_proj.repo.ProductRepo productRepo; // Ensure you have your ProductRepo injected

    @PostMapping("/add/{productId}")
    public ResponseEntity<String> addToWishlist(@PathVariable Integer productId) {
        // 1. Get the current logged-in user details
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 2. Create the User and Product objects to link them (using IDs)
        com.telusko.ecom_proj.model.User user = new com.telusko.ecom_proj.model.User();
        user.setId(userDetails.getId());

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 3. Create and save the Wishlist entity
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);

        wishlistRepository.save(wishlist); // This is the missing line that triggers the SQL INSERT

        return ResponseEntity.ok("Added to wishlist");
    }

    @GetMapping
    public ResponseEntity<List<Product>> getWishlist() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);

        // This extracts the nested Product objects for the React frontend
        List<Product> userWishlist = wishlistItems.stream()
                .map(Wishlist::getProduct)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userWishlist);
    }
    @DeleteMapping("/wishlist/remove/{productId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> removeFromWishlist(@PathVariable int productId) {
        // Your logic to remove the item from the database
        // Example: wishlistService.removeItem(userDetails.getId(), productId);
        return ResponseEntity.ok(new MessageResponse("Item removed from wishlist"));
    }
}