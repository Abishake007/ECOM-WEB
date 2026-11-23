package com.telusko.ecom_proj.repo;

import com.telusko.ecom_proj.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {

    @Query("SELECT p.id AS id, p.name AS name, p.description AS description, " +
            "p.brand AS brand, p.price AS price, p.discountPercentage AS discountPercentage, " +
            "p.category AS category, p.releaseDate AS releaseDate, " +
            "p.productAvailable AS productAvailable, p.stockQuantity AS stockQuantity " +
            "FROM Product p")
    List<ProductSummary> findAllSummaries();

    // Custom JPQL search for the marketplace global search bar
    @Query("SELECT p.id AS id, p.name AS name, p.description AS description, " +
            "p.brand AS brand, p.price AS price, p.discountPercentage AS discountPercentage, " +
            "p.category AS category, p.releaseDate AS releaseDate, " +
            "p.productAvailable AS productAvailable, p.stockQuantity AS stockQuantity " +
            "FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ProductSummary> searchProducts(@Param("keyword") String keyword);
}
