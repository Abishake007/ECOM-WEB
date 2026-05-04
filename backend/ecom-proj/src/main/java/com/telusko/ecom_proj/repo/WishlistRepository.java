// File: C:\Users\ACER\Downloads\Ecom-Web\backend\ecom-proj\src\main\java\com\telusko\ecom_proj\repo\WishlistRepository.java
package com.telusko.ecom_proj.repo;

import com.telusko.ecom_proj.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    // Find all wishlist items for a specific user ID
    List<Wishlist> findByUserId(Long userId);

    // Check if a specific product is already in a user's wishlist
    boolean existsByUserIdAndProductId(Long userId, Integer productId);
}