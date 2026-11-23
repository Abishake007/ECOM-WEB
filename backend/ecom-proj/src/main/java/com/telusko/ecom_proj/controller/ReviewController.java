package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.Product;
import com.telusko.ecom_proj.model.Review;
import com.telusko.ecom_proj.repo.ProductRepo;
import com.telusko.ecom_proj.repo.ReviewRepository;
import com.telusko.ecom_proj.security.services.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/product/{productId}/reviews")
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final ProductRepo productRepo;

    public ReviewController(ReviewRepository reviewRepository, ProductRepo productRepo) {
        this.reviewRepository = reviewRepository;
        this.productRepo = productRepo;
    }

    @GetMapping
    public List<Review> getReviews(@PathVariable Integer productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addReview(@PathVariable Integer productId,
            @RequestBody ReviewRequest request, Authentication authentication) {
        if (request.rating < 1 || request.rating > 5 || request.comment == null || request.comment.isBlank()) {
            return ResponseEntity.badRequest().body("Enter a comment and a rating from 1 to 5.");
        }
        Product product = productRepo.findById(productId).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
        Review review = new Review();
        review.setProduct(product);
        review.setReviewerName(user.getUsername());
        review.setRating(request.rating);
        review.setComment(request.comment.trim());
        review.setCreatedAt(new Date());
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    public static class ReviewRequest {
        public int rating;
        public String comment;
    }
}
