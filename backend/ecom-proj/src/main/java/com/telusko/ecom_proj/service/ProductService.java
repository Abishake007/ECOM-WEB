package com.telusko.ecom_proj.service;

import com.telusko.ecom_proj.model.Product;
import com.telusko.ecom_proj.model.Review;
import com.telusko.ecom_proj.repo.ProductRepo;
import com.telusko.ecom_proj.repo.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Required for delete
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Product getProductById(int id) {
        return repo.findById(id).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());
        return repo.save(product);
    }

    // Version 1: Handling update WITH a new image
    public Product updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());
        return repo.save(product);
    }

    // Version 2: Handling update WITHOUT a new image (Overloaded)
    public Product updateProduct(int id, Product product) {
        // This keeps the existing image data already attached to the product object
        return repo.save(product);
    }

    /**
     * Deletes a product and all its related entities (Wishlist items, etc.)
     * @Transactional ensures that if any part of the deletion fails,
     * the database rolls back to its previous state.
     */
    @Transactional
    public void deleteProduct(int id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
        } else {
            throw new RuntimeException("Product not found with id: " + id);
        }
    }

    public List<Product> searchProduct(String keyword) {
        return repo.searchProducts(keyword);
    }

    public Review addReviewToProduct(Integer productId, Review review) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        review.setProduct(product);
        review.setCreatedAt(new Date());

        return reviewRepository.save(review);
    }
}