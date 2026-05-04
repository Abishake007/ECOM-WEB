package com.telusko.ecom_proj.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> data) throws StripeException {
        // Set the secret key before making requests to Stripe
        com.stripe.Stripe.apiKey = stripeSecretKey;

        Long amount = Long.valueOf(data.get("amount").toString());
        String currency = (String) data.get("currency");

        // Stripe requires a description for Indian Export/Domestic transactions
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency != null ? currency : "usd")
                .setDescription("E-commerce Purchase for " + currency)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("clientSecret", intent.getClientSecret());

        return ResponseEntity.ok(responseData);
    }
}