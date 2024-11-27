package com.example.backend.Domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;

@Entity
public class Fertilizing extends Action{

    @Column(length = 100) // Limit fertilizer type length to 100 characters
    private String fertilizerType;

    @Positive // Ensure application rate is positive
    private Double applicationRate;

    @Column(length = 100) // Limit method length to 100 characters
    private String method;

    // Getters and Setters
    public String getFertilizerType() {
        return fertilizerType;
    }

    public void setFertilizerType(String fertilizerType) {
        this.fertilizerType = fertilizerType;
    }

    public Double getApplicationRate() {
        return applicationRate;
    }

    public void setApplicationRate(Double applicationRate) {
        this.applicationRate = applicationRate;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }
}
