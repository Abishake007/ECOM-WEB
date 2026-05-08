package com.telusko.ecom_proj.repo;

import com.telusko.ecom_proj.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    // Standard CRUD operations for gallery images
}