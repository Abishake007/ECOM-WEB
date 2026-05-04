package com.telusko.ecom_proj.payload.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private List<CartItemRequest> items;
    private BigDecimal totalAmount;

    @Data
    public static class CartItemRequest {
        private Integer productId;
        private Integer quantity;
        private BigDecimal price;
    }
}
