package com.telusko.ecom_proj.payload.request;

import lombok.Data;

@Data
public class SupportRequest {
    private String type;
    private String subject;
    private String message;
    private Long productId;
    private Long orderId;
}
