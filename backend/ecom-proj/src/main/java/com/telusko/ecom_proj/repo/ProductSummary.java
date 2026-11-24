package com.telusko.ecom_proj.repo;

import java.math.BigDecimal;
import java.util.Date;

/** A product list view that deliberately excludes image BLOB columns. */
public interface ProductSummary {
    Integer getId();
    String getName();
    String getDescription();
    String getBrand();
    BigDecimal getPrice();
    Integer getDiscountPercentage();
    String getCategory();
    Date getReleaseDate();
    Boolean getProductAvailable();
    Integer getStockQuantity();

    default String getImageUrl() {
        return getId() == null ? null : "/product/" + getId() + "/image";
    }
}
