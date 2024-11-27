package com.example.backend.Domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

@Entity
public class Harvesting extends Action{
    
    @PositiveOrZero // Ensure crop yield is zero or positive
    private Double cropYield;

    private LocalDate harvestDate; // Use LocalDate for proper date handling

    @Column(length = 500) // Limit comment length to 500 characters
    private String comments;

    // Getters and Setters
    public Double getCropYield() {
        return cropYield;
    }

    public void setCropYield(Double cropYield) {
        this.cropYield = cropYield;
    }

    public LocalDate getHarvestDate() {
        return harvestDate;
    }

    public void setHarvestDate(LocalDate harvestDate) {
        this.harvestDate = harvestDate;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
