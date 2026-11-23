// src/main/java/com/telusko/ecom_proj/repo/ReviewRepository.java

package com.telusko.ecom_proj.repo;

import com.telusko.ecom_proj.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    java.util.List<Review> findByProductIdOrderByCreatedAtDesc(Integer productId);
}
