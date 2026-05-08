package com.telusko.ecom_proj.service;

import com.telusko.ecom_proj.model.Product;
import com.telusko.ecom_proj.model.ProductImage;
import com.telusko.ecom_proj.model.Review;
import com.telusko.ecom_proj.repo.ProductRepo;
import com.telusko.ecom_proj.repo.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
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

   public Product addProduct(Product product, List<MultipartFile> imageFiles) throws IOException {
        if (imageFiles != null && !imageFiles.isEmpty()) {
            // Set the first image as the Primary Image
            MultipartFile firstImage = imageFiles.get(0);
            product.setImageName(firstImage.getOriginalFilename());
            product.setImageType(firstImage.getContentType());
            product.setImageData(firstImage.getBytes());

            // Save the rest into the Gallery
            List<ProductImage> gallery = new ArrayList<>();
            for (MultipartFile file : imageFiles) {
                ProductImage img = new ProductImage();
                img.setName(file.getOriginalFilename());
                img.setType(file.getContentType());
                img.setData(file.getBytes());
                img.setProduct(product);
                gallery.add(img);
            }
            product.setGallery(gallery);
        }
        return repo.save(product);
    }

    // Version 1: Handling marketplace update WITH a new high-res image
    public Product updateProduct(int id, Product product, List<MultipartFile> imageFiles) throws IOException {
        if (imageFiles != null && !imageFiles.isEmpty()) {
            MultipartFile firstImage = imageFiles.get(0);
            product.setImageName(firstImage.getOriginalFilename());
            product.setImageType(firstImage.getContentType());
            product.setImageData(firstImage.getBytes());
        }
        return repo.save(product);
    }

    // This remains for updates that don't touch images
    public Product updateProduct(int id, Product product) {
        return repo.save(product);
    }

    /**
     * @Transactional ensures that if the deletion of the product or its 
     * related entities (like Wishlist) fails, the DB rolls back.
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

    // Logic for adding customer reviews to the product detail page
    public Review addReviewToProduct(Integer productId, Review review) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        review.setProduct(product);
        review.setCreatedAt(new Date());

        return reviewRepository.save(review);
    }
}