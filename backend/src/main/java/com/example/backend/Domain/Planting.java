package com.example.backend.Domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Planting extends Action{
    @Column(length = 100, nullable = false) // Limit crop type length to 100 characters
    private String cropType;

    @Column(length = 100) // Limit variety length to 100 characters
    private String variety;

    @Column(length = 50) // Limit seeding rate length to 50 characters
    private String seedingRate;

    private LocalDate plantingDate; // Use LocalDate for proper date handling

    // Getters and Setters
    public String getCropType() {
        return cropType;
    }

    public void setCropType(String cropType) {
        this.cropType = cropType;
    }

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }

    public String getSeedingRate() {
        return seedingRate;
    }

    public void setSeedingRate(String seedingRate) {
        this.seedingRate = seedingRate;
    }

    public LocalDate getPlantingDate() {
        return plantingDate;
    }

    public void setPlantingDate(LocalDate plantingDate) {
        this.plantingDate = plantingDate;
    }
}
