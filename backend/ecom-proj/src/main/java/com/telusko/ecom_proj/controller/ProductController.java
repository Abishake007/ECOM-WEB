package com.telusko.ecom_proj.controller;

import com.telusko.ecom_proj.model.Product;
import com.telusko.ecom_proj.model.User;
import com.telusko.ecom_proj.payload.response.MessageResponse;
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

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProduct(){
        // Ensure your service is actually returning a list
        return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> grtProduct(@PathVariable int id){
        Product product = service.getProductById(id);
        if(product != null)
            return new ResponseEntity<>(product, HttpStatus.OK);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

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

    @PostMapping("/product")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(@RequestPart Product product, @RequestPart MultipartFile imageFile){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            product.setUser(userRepository.findById(userDetails.getId()).orElse(null));
            return new ResponseEntity<>(service.addProduct(product, imageFile), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        service.deleteProduct(id); // Use 'service' as defined at the top of your controller
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully"));
    }

    @PutMapping("/product/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable int id,
                                           @RequestPart Product product,
                                           @RequestPart(required = false) MultipartFile imageFile) {
        try {
            Product updatedProduct;
            if (imageFile != null && !imageFile.isEmpty()) {
                // Calls the 3-argument version
                updatedProduct = service.updateProduct(id, product, imageFile);
            } else {
                // Calls the 2-argument version (The one you were missing)
                updatedProduct = service.updateProduct(id, product);
            }
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}