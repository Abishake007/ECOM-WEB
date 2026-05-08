package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.Product;
import com.telusko.ecom_proj.model.ProductImage;
import com.telusko.ecom_proj.payload.response.MessageResponse;
import com.telusko.ecom_proj.repo.ProductImageRepository;
import com.telusko.ecom_proj.repo.UserRepository;
import com.telusko.ecom_proj.security.services.UserDetailsImpl;
import com.telusko.ecom_proj.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") 
public class ProductController {

    @Autowired
    private ProductService service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductImageRepository imageRepo;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProduct() {
        return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id) {
        Product product = service.getProductById(id);
        if (product != null)
            return new ResponseEntity<>(product, HttpStatus.OK);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Streams the primary image data for the product gallery.
     */
    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId) {
        Product product = service.getProductById(productId);
        if (product != null && product.getImageData() != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(product.getImageType()))
                    .body(product.getImageData());
        }
        return ResponseEntity.notFound().build();
    }

    /**
 * Streams secondary gallery images by their specific ID.
 */
@GetMapping("/product/image/{imageId}")
public ResponseEntity<byte[]> getGalleryImage(@PathVariable Long imageId) {
    return imageRepo.findById(imageId)
            .map(image -> ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(image.getType()))
                    .body(image.getData()))
            .orElse(ResponseEntity.notFound().build());
}

    /**
     * Adds a new product with multiple image support.
     * Links the product to the currently authenticated User.
     */
    @PostMapping("/product")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(
            @RequestPart Product product,
            @RequestPart List<MultipartFile> imageFiles) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

            // Automatically link the product to the logged-in user
            product.setUser(userRepository.findById(userDetails.getId()).orElse(null));

            // service.addProduct must be updated to accept List<MultipartFile>
            return new ResponseEntity<>(service.addProduct(product, imageFiles), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Updates an existing product. 
     * Image list is optional; if empty, existing images are preserved.
     */
    @PutMapping("/product/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable int id,
                                           @RequestPart Product product,
                                           @RequestPart(required = false) List<MultipartFile> imageFiles) {
        try {
            Product updatedProduct;
            if (imageFiles != null && !imageFiles.isEmpty()) {
                // Handle update with new image gallery
                updatedProduct = service.updateProduct(id, product, imageFiles);
            } else {
                // Handle update for text fields only
                updatedProduct = service.updateProduct(id, product);
            }
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Removes a product from the marketplace. restricted to ADMIN.
     */
    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        service.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully"));
    }
    
    /**
     * Global Search endpoint for the Amazon-style header.
     */
    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        List<Product> products = service.searchProduct(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
}