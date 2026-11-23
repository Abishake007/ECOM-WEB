package com.telusko.ecom_proj.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String reviewerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_user_id")
    @JsonIgnore
    private User reviewer;

    @JsonProperty("reviewerUserId")
    public Long getReviewerUserId() {
        return reviewer == null ? null : reviewer.getId();
    }
    
    @Column(length = 1000)
    private String comment;
    
    private int rating; // 1 to 5 scale
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonBackReference // Prevents infinite recursion during JSON serialization
    private Product product;
}
