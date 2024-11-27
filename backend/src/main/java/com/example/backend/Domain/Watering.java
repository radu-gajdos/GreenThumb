package com.example.backend.Domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
public class Watering extends Action{
    @Column(length = 50) // Limit method length to 50 characters
    private String method;

    @PositiveOrZero // Ensures the amount is zero or positive
    private Double amount;

    @Column(length = 100) // Limit water source length to 100 characters
    private String waterSource;

    // Getters and Setters
    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getWaterSource() {
        return waterSource;
    }

    public void setWaterSource(String waterSource) {
        this.waterSource = waterSource;
    }
}
