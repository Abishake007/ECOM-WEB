package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.Product;
import com.telusko.ecom_proj.model.Review;
import com.telusko.ecom_proj.model.User;
import com.telusko.ecom_proj.repo.ProductRepo;
import com.telusko.ecom_proj.repo.ReviewRepository;
import com.telusko.ecom_proj.repo.UserRepository;
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
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, ProductRepo productRepo, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepo = productRepo;
        this.userRepository = userRepository;
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
        User reviewer = userRepository.findById(user.getId()).orElse(null);
        if (reviewer == null) return ResponseEntity.status(401).body("Please sign in to leave a review.");
        Review review = new Review();
        review.setProduct(product);
        review.setReviewer(reviewer);
        review.setReviewerName(user.getUsername());
        review.setRating(request.rating);
        review.setComment(request.comment.trim());
        review.setCreatedAt(new Date());
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteReview(@PathVariable Integer productId, @PathVariable Integer reviewId,
            Authentication authentication) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null || review.getProduct() == null || !review.getProduct().getId().equals(productId)) {
            return ResponseEntity.notFound().build();
        }
        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        boolean isAuthor = review.getReviewer() != null && review.getReviewer().getId().equals(currentUser.getId());
        if (!isAdmin && !isAuthor) return ResponseEntity.status(403).body("Only the review author or an admin can delete this review.");
        reviewRepository.delete(review);
        return ResponseEntity.noContent().build();
    }

    public static class ReviewRequest {
        public int rating;
        public String comment;
    }
}
